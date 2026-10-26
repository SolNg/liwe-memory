// ============================================================
// Plugin Nhật ký nhân vật v2.0.0 — Engine nhật ký (quy trình cốt lõi)
// Đường dẫn: SillyTavern/extensions/character-diary/engine.js
// ============================================================
'use strict';

/** Khóa loại trừ — tránh tạo đồng thời làm hỏng dữ liệu */
let cdBusy = false;
let cdPending = false;  // Khi đang khóa mà lại nhận tín hiệu kích hoạt, đánh dấu “xong thì chạy thêm một vòng”

/**
 * Thực hiện một lần tạo nhật ký + quan hệ.
 * @param {{ manual?: boolean, silent?: boolean }} opts
 *   manual: true = người dùng kích hoạt thủ công, dù enabled=false vẫn chạy
 *   silent: true = không bật thông báo toastr (dùng cho kích hoạt tự động)
 */
async function cdRunDiary({ manual = false, silent = false, extraFloors = null } = {}) {
  if (cdBusy) {
    if (manual) { toastr.info('Đang viết, vui lòng chờ'); cdPending = true; }
    return;
  }

  const s = cdGetSettings();
  if (!s.enabled && !manual) return;

  let data = await cdGetData();
  
  // Nếu kích hoạt tự động đã truyền vào các tầng tính sẵn thì dùng thẳng
  let windowFloors;
  if (extraFloors && Array.isArray(extraFloors) && extraFloors.length) {
    windowFloors = extraFloors;
  } else {
    windowFloors = await cdGetNewFloors(data);
  }

  if (!windowFloors.length) {
    if (manual && !silent) toastr.info('Không có tầng mới cần viết nhật ký');
    return;
  }

  if (windowFloors.length > (s.maxWindowFloors || 40))
    windowFloors = windowFloors.slice(-(s.maxWindowFloors || 40));

  cdBusy = true;
  try {
    if (!silent) toastr.info(`Bắt đầu viết nhật ký (${windowFloors.length} tầng mới)...`);

    // Đồng thời: nhật ký + quan hệ + hồ sơ cốt truyện
    const diaryMsgs    = cdBuildDiaryPrompt(windowFloors, data, s);
    const relMsgs      = cdBuildRelationPrompt(windowFloors, data, s);
    const archiveMsgs  = cdBuildArchivePrompt(windowFloors, data, s);
    const [diaryRes, relRes, archiveRes] = await Promise.allSettled([
      cdApiComplete(diaryMsgs, s),
      cdApiComplete(relMsgs, s),
      cdApiComplete(archiveMsgs, s),
    ]);

    let diaryOk   = false;
    let relOk     = false;
    let archiveOk = false;

    // Xử lý nhật ký
    if (diaryRes.status === 'fulfilled') {
      try {
        const npcs = parseDiaryJson(diaryRes.value);
        data = mergeDiaries(data, npcs, windowFloors, s);
        diaryOk = true;
      } catch (e) {
        cdWarn('Phân tích nhật ký thất bại', e);
        if (manual) toastr.error('Tạo nhật ký thất bại: ' + e.message);
      }
    } else {
      if (manual) toastr.error('Request nhật ký thất bại: ' + (diaryRes.reason && diaryRes.reason.message));
    }

    // Xử lý quan hệ (độc lập)
    if (relRes.status === 'fulfilled') {
      try {
        const rels = parseRelationJson(relRes.value);
        data = mergeRelations(data, rels);
        relOk = true;
      } catch (e) {
        cdWarn('Phân tích quan hệ thất bại', e);
        if (manual) toastr.warning('Cập nhật quan hệ thất bại (nhật ký không bị ảnh hưởng)');
      }
    } else {
      if (manual) toastr.warning('Request quan hệ thất bại (nhật ký không bị ảnh hưởng)');
    }

    // Xử lý hồ sơ cốt truyện (độc lập)
    if (archiveRes.status === 'fulfilled') {
      try {
        const arc = parseArchiveJson(archiveRes.value);
        if (!data.archive) data.archive = Object.assign({}, emptyData().archive);
        // Chỉ khi AI trả về nội dung không rỗng mới ghi đè trường tương ứng, nếu không thì giữ giá trị cũ
        if (arc.mainline !== undefined && arc.mainline !== '')   data.archive.mainline   = arc.mainline;
        if (arc.sideline !== undefined && arc.sideline !== '')   data.archive.sideline   = arc.sideline;
        if (arc.states !== undefined && arc.states !== '')       data.archive.states     = arc.states;
        if (arc.unresolved !== undefined && arc.unresolved !== '') data.archive.unresolved = arc.unresolved;
        archiveOk = true;
      } catch (e) {
        cdWarn('Phân tích hồ sơ cốt truyện thất bại', e);
        if (manual) toastr.warning('Cập nhật hồ sơ cốt truyện thất bại (nhật ký không bị ảnh hưởng)');
      }
    } else {
      if (manual) toastr.warning('Request hồ sơ cốt truyện thất bại (nhật ký không bị ảnh hưởng)');
    }

    // Lưu
    if (diaryOk || relOk || archiveOk) {
      await cdSaveData(data);
      if (diaryOk) await cdSyncWorldbook(data);
      if (!silent) {
        const tips = [];
        if (diaryOk) tips.push('Đã cập nhật nhật ký');
        if (relOk) tips.push('Đã cập nhật quan hệ');
        if (archiveOk) tips.push('Đã cập nhật hồ sơ cốt truyện');
        toastr.success(tips.join(' · '));
      } else {
        cdLog('Nhật ký tự động hoàn tất');
      }
    }
  } catch (e) {
    cdWarn('runDiary lỗi', e);
    if (manual && !silent) toastr.error('Viết nhật ký thất bại: ' + e.message);
  } finally {
    cdBusy = false;
    // Nếu trong lúc bận lại nhận kích hoạt thì chạy thêm một lần
    if (cdPending) {
      cdPending = false;
      cdRunDiary({ manual: false, silent: true });
    }
  }
}

/**
 * Callback nhận tin nhắn: dựa trên bộ đếm lastTriggerFloor để “mỗi N tầng kích hoạt một lần”
 * ★ Tính thẳng windowFloors truyền vào cdRunDiary, tránh kiểm tra nội bộ không nhất quán
 */
async function cdOnMessageReceived() {
  const s = cdGetSettings();
  if (!s.enabled) return;
  if (s.autoSummary === false) return;
  
  const data = await cdGetData();
  const currentMaxFloor = getLastFloorId();
  if (currentMaxFloor < 0) return;
  const lastTriggerFloor = data._lastTriggerFloor ?? -1;
  const interval = s.interval || 5;
  
  cdLog('Kiểm tra kích hoạt tự động: tầng lớn nhất hiện tại', currentMaxFloor, 'tầng kích hoạt lần trước', lastTriggerFloor, 'khoảng cách', interval);
  
  const aiFloors = await cdGetAiFloors();
  const newFloors = aiFloors.filter(m => m.message_id > lastTriggerFloor);
  const newAiCount = newFloors.length;
  
  if (newAiCount >= interval) {
    cdLog('Kích hoạt tự động: số tầng AI mới thêm', newAiCount, '>=', interval);
    
    let windowFloors = newFloors;
    if (windowFloors.length > (s.maxWindowFloors || 40))
      windowFloors = windowFloors.slice(-(s.maxWindowFloors || 40));
    
    data._lastTriggerFloor = currentMaxFloor;
    await cdSaveData(data);
    await cdRunDiary({ manual: false, silent: true, extraFloors: windowFloors });
  }
}

/**
 * Callback xóa/thu hồi tin nhắn
 */
async function cdOnMessageDeleted(floor) {
  await cdRollbackFrom(floor);
}