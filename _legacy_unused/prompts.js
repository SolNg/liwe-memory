// ============================================================
// Plugin Nhật ký nhân vật v2.0.0 — Prompt & phân tích JSON
// Đường dẫn: SillyTavern/extensions/character-diary/prompts.js
// ============================================================
'use strict';

/* ============================== Prompt: nhật ký ============================== */
function cdBuildDiaryPrompt(windowFloors, data, s) {
  const known = Object.keys(data.diaries).map(name => {
    const al = (data.aliases[name] || []);
    return al.length ? `${name}(biệt danh: ${al.join(', ')})` : name;
  });
  const memory = Object.entries(data.diaries).map(([name, list]) => {
    const last = list[list.length - 1];
    if (!last) return '';
    return `【${name}】lần trước (${last.date || 'Tầng ' + last.turn + ''}): ${last.entry}\n  Tâm trạng:${last.mood} Thái độ với người dùng:${last.attitude_to_user}`;
  }).filter(Boolean).join('\n');
  const scene = windowFloors.map(m => `[#${m.message_id} ${m.name}] ${m.message}`).join('\n\n');
  const sys = [
    'Bạn là người ghi chép “Nhật ký nhân vật”. Đọc đoạn cốt truyện được cho, với mỗi nhân vật xuất hiện có tên có vai diễn trong đó, viết một bài nhật ký bằng góc nhìn chủ quan ngôi thứ nhất của nhân vật đó.',
    'Yêu cầu:',
    '- Chỉ viết cho nhân vật có tên, có vai diễn thực tế. Người qua đường thuần túy, đám đông vô danh thì bỏ qua.',
    '- Đừng viết nhật ký cho nhân vật của người dùng/người chơi.',
    s.mainCardIsGM ? '- Nếu nhân vật nào là người dẫn truyện/hệ thống/góc nhìn thượng đế/người kể kiểu GM thì đừng viết cho nó.' : '',
    '- Ngôi thứ nhất, mang cảm xúc, tư tâm, cách hiểu chủ quan của nhân vật đó (có thể lệch với sự thật). Cùng một sự kiện, các nhân vật khác nhau có thể nhớ khác nhau.',
    '- entry là tóm tắt nhật ký, không phải kể lại cốt truyện: tập trung vào hoạt động tâm lý, cảm xúc, thay đổi quan hệ, quyết định then chốt của nhân vật.',
    '- Khi liên quan đến tình tiết lộ liễu như tình dục/bạo lực, chỉ cần nhắc tới một cách khái quát ngắn gọn (ví dụ “đã quan hệ với anh ấy”, “bị anh ấy khống chế”), nghiêm cấm mô tả từng chữ động tác, cơ quan, dịch cơ thể và các chi tiết lộ liễu khác. Nhật ký trọng ghi lại “chuyện gì đã xảy ra và cảm nhận của tôi”, chứ không phải tái hiện quá trình.',
    '- Mỗi entry giới hạn trong 150 chữ, ngắn gọn cô đọng.',
    '- Dùng lại tên chính trong “danh sách nhân vật đã biết”; nếu nhận ra biệt danh/cách gọi khác thì quy gộp vào tên chính đã có, và bổ sung biệt danh trong aliases.',
    '- Ngôn ngữ: dùng tiếng Việt.',
    '- Dùng is_minor đánh dấu mức quan trọng của nhân vật: nhân vật chính, vai phụ quan trọng, NPC có tên có vai diễn đánh false; người qua đường thuần túy chỉ xuất hiện một hai câu, không quan trọng đánh true.',
    'Chỉ xuất JSON nghiêm ngặt, định dạng:',
    '{"npcs":[{"name":"Tên chính","aliases":["Biệt danh"],"is_minor":false,"date":"Thời gian trong cốt truyện hoặc tầng N","turn":số tầng,"entry":"Nội dung ngôi thứ nhất (trong 150 chữ)","mood":"Tâm trạng","attitude_to_user":"Thái độ với người dùng","secret":"Tâm tư chưa nói ra","key_events":["Sự kiện then chốt"],"relationship_with_others":{"Nhân vật nào đó":"Mô tả quan hệ"}}]}',
  ].filter(Boolean).join('\n');
  const usr = [
    known.length ? `Danh sách nhân vật đã biết: ${known.join('; ')}` : 'Danh sách nhân vật đã biết: (chưa có)',
    memory ? `Ký ức hiện có của các nhân vật (nhật ký mới nhất):\n${memory}` : 'Ký ức hiện có của các nhân vật: (chưa có)',
    `Đoạn cốt truyện lần này:\n${scene}`,
    'Hãy xuất JSON.',
  ].join('\n\n');
  return [
    { role: 'system', content: JAILBREAK + '\n\n' + sys },
    { role: 'user', content: usr },
    { role: 'assistant', content: '{"npcs":[' },
  ];
}

/* ============================== Prompt: hồ sơ cốt truyện ============================== */
const ARCHIVE_SYSTEM = [
  'Bây giờ bạn là người sắp xếp hồ sơ cốt truyện.',
  'Nhiệm vụ là sắp xếp lịch sử trò chuyện được cho thành hồ sơ cốt truyện có thể viết tiếp lâu dài, để các cuộc hội thoại sau trích dẫn trực tiếp.',
  '',
  'Lưu ý: đoạn trò chuyện này là 【các tầng mới thêm lần này】, không phải toàn bộ câu chuyện. Bạn bắt buộc phải mở rộng tăng dần dựa trên “tiến triển cốt truyện đã có”, chứ không viết lại từ đầu.',
  '',
  'Nguyên tắc viết:',
  '1. Chỉ viết sự thật đã xảy ra, không viết suy đoán, đánh giá, tô vẽ bầu không khí hay phân tích tâm lý.',
  '2. Khi kể ưu tiên trình bày nhân vật, thời gian, địa điểm, hành động, nội dung đối thoại then chốt, kết quả.',
  '3. Chuyện phiếm và nội dung lặp lại không có tác dụng thúc đẩy cốt truyện có thể nén lại, nhưng không được sót các ước định, điều kiện, giao dịch, xung đột, quyết định và thay đổi trạng thái rõ ràng đã thành lập.',
  '4. Trong sự kiện nếu xuất hiện vật phẩm, chứng cứ, số tiền, thuốc, điều ước, mật danh, thân phận, chức vụ, thương bệnh, thay đổi sinh lý, thay đổi quan hệ, thay đổi vị trí thì phải viết rõ nội dung cụ thể, đừng khái quát thành “vật gì đó”, “tin tình báo gì đó”, “đã có thay đổi”.',
  '5. Khi xác định rõ được người có mặt, người chứng kiến, người tham gia thì phải ghi rõ, tránh sau này rối loạn quan hệ nhân vật hoặc phạm vi người biết chuyện.',
  '6. Nếu một sự kiện liên tục trải qua nhiều đoạn trò chuyện thì nên gộp thành sự kiện hoàn chỉnh, đừng máy móc cắt vụn theo tầng.',
  '7. Nếu nguyên văn có nội dung bạo lực, tương tác người lớn, sỉ nhục, thương bệnh, máu me hoặc nhạy cảm khác thì đừng bỏ qua, cũng đừng tô đẹp, chỉ dùng từ ngữ khách quan trung tính để ghi lại.',
  '8. Đầu ra chỉ được là văn bản thuần, không thêm gạch đầu dòng, không đánh số, không giải thích cách làm của bạn.',
  '',
  'Điều cấm:',
  '1. Đừng dùng những nhãn trừu tượng như “bầu không khí mập mờ”, “đấu trí tâm lý”, “tuyên bố chủ quyền”, “ham muốn chiếm hữu”, “khiêu khích bằng lời”, “tiến hành vỗ về”.',
  '2. Đừng dùng những câu rỗng như “có người đe dọa đối phương”, “hai bên đạt được điều kiện” thay cho nội dung cụ thể; ghi rõ được nội dung cốt lõi thì ghi rõ.',
  '3. Đừng tự ý bổ sung ngày, giờ, động cơ, lập trường hay nhân quả. Nguyên văn không có thì giữ là không có.',
  '',
  'Mục tiêu và định dạng đầu ra:',
  'Hãy xuất văn bản thuần nghiêm ngặt theo bốn trường sau, mỗi trường một đoạn văn, không đánh số không liệt kê:',
  '',
  'Tuyến chính:',
  '(Tiến triển cốt truyện mới thêm lần này, nối được với tiến triển đã có)',
  '',
  'Tuyến phụ:',
  '(Tiến triển tuyến phụ lần này)',
  '',
  'Thay đổi trạng thái quan trọng:',
  '(Chỉ liệt kê các trạng thái mới thêm/thay đổi lần này — thay đổi vị trí, thay đổi thân phận, thương bệnh, thay đổi quan hệ, thông tin biết được...)',
  '',
  'Việc chưa giải quyết:',
  '(Việc chưa giải quyết đã có mà đã hoàn thành thì xóa, việc mới thêm lần này thì thêm vào)',
].join('\n');

function cdBuildArchivePrompt(windowFloors, data, _s) {
  const existing = data.archive || emptyData().archive;
  const scene = windowFloors.map(m => `[#${m.message_id} ${m.name}] ${m.message}`).join('\n\n');
  const sys = [
    ARCHIVE_SYSTEM,
    '',
    '**Tiến triển cốt truyện đã có (hãy mở rộng tăng dần, đừng lặp lại)**:',
    existing.mainline ? `Tuyến chính đã biết: ${existing.mainline}` : 'Tuyến chính đã biết: (chưa có, đây là lần đầu)',
    existing.sideline ? `Tuyến phụ đã biết: ${existing.sideline}` : '',
    existing.states ? `Trạng thái quan trọng đã biết: ${existing.states}` : '',
    existing.unresolved ? `Việc chưa giải quyết đã biết: ${existing.unresolved}` : '',
  ].filter(Boolean).join('\n');
  const usr = [
    `Các tầng mới thêm lần này:\n${scene}`,
    '',
    'Hãy xuất: Tuyến chính, Tuyến phụ, Thay đổi trạng thái quan trọng, Việc chưa giải quyết',
  ].join('\n');
  return [
    { role: 'system', content: sys },
    { role: 'user', content: usr },
    { role: 'assistant', content: 'Tuyến chính:' },
  ];
}

/** Phân tích bốn trường của hồ sơ cốt truyện */
function parseArchiveJson(text) {
  const raw = String(text || '').trim();
  // Cắt theo bốn nhãn
  const re = /(?:^|\n)(主线|支线|重要状态变化|未解决事项|Tuyến chính|Tuyến phụ|Thay đổi trạng thái quan trọng|Việc chưa giải quyết)[：:]([\s\S]*?)(?=(?:\n主线|\n支线|\n重要状态变化|\n未解决事项|\nTuyến chính|\nTuyến phụ|\nThay đổi trạng thái quan trọng|\nViệc chưa giải quyết)[：:]|$)/g;
  let mainline = '', sideline = '', states = '', unresolved = '';
  let match;
  while ((match = re.exec(raw)) !== null) {
    const label = match[1].trim();
    const body  = match[2].trim();
    switch (label) {
      case 'Tuyến chính': mainline = body; break;
      case 'Tuyến phụ': sideline = body; break;
      case 'Thay đổi trạng thái quan trọng': states = body; break;
      case 'Việc chưa giải quyết': unresolved = body; break;
    }
  }
  return { mainline, sideline, states, unresolved };
}
function cdBuildRelationPrompt(windowFloors, data, _s) {
  const known = Object.keys(data.diaries);
  const scene = windowFloors.map(m => `[#${m.message_id} ${m.name}] ${m.message}`).join('\n\n');
  const sys = [
    'Bạn là người phân tích quan hệ nhân vật. Đọc đoạn cốt truyện được cho, trích xuất “quan hệ chủ quan một chiều” giữa các nhân vật.',
    'Yêu cầu:',
    '- Chủ quan một chiều: quan hệ from nhìn to (from nhìn nhận to thế nào). A nhìn B và B nhìn A có thể khác nhau, hãy ghi riêng mỗi chiều một mục.',
    '- Chỉ phân tích quan hệ giữa các nhân vật có tên có vai diễn, bỏ qua người qua đường thuần túy.',
    '- Đừng bao gồm nhân vật người dùng/người chơi.',
    '- type: dùng từ ngắn khái quát tính chất quan hệ (như “bạn thân”, “thầm thương”, “thù địch”, “chủ tớ”, “cảnh giác”, “phụ thuộc”).',
    '- attitude: khuynh hướng cảm xúc, chỉ được là một trong "positive" (thân thiện/gần gũi), "negative" (thù địch/bài xích), "neutral" (trung lập).',
    '- note: một câu thuyết minh (trong 20 chữ).',
    known.length ? `Nhân vật đã biết: ${known.join(', ')}` : '',
    'Chỉ xuất JSON nghiêm ngặt, định dạng:',
    '{"relations":[{"from":"A","to":"B","type":"Tính chất quan hệ","attitude":"positive","note":"Thuyết minh ngắn"}]}',
  ].filter(Boolean).join('\n');
  const usr = `Đoạn cốt truyện lần này:\n${scene}\n\nHãy xuất JSON quan hệ.`;
  return [
    { role: 'system', content: JAILBREAK + '\n\n' + sys },
    { role: 'user', content: usr },
    { role: 'assistant', content: '{"relations":[' },
  ];
}

/* ============================== Phân tích JSON vững chắc ============================== */

/** Thoát các ký tự không hợp lệ như xuống dòng/tab bên trong chuỗi JSON */
function sanitizeJsonString(s) {
  let out = '';
  let inStr3 = false;
  let escaped3 = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr3) {
      if (escaped3) { out += ch; escaped3 = false; continue; }
      if (ch === '\\') { out += ch; escaped3 = true; continue; }
      if (ch === '"') { out += ch; inStr3 = false; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { out += '\\r'; continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
    } else {
      if (ch === '"') { inStr3 = true; out += ch; continue; }
      out += ch;
    }
  }
  return out;
}

/** Quét từ startIdx để trích mọi object { ... } cấp cao nhất hoàn chỉnh */
function scanObjects(t, startIdx) {
  const results = [];
  let depth = 0;
  let objStart = -1;
  let inStr2 = false;
  let escaped2 = false;
  for (let i = startIdx; i < t.length; i++) {
    const ch = t[i];
    if (inStr2) {
      if (escaped2) { escaped2 = false; continue; }
      if (ch === '\\') { escaped2 = true; continue; }
      if (ch === '"') { inStr2 = false; }
      continue;
    }
    if (ch === '"') { inStr2 = true; continue; }
    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart >= 0) {
        try { results.push(JSON.parse(t.slice(objStart, i + 1))); } catch (e) { /* skip bad */ }
        objStart = -1;
      }
    }
  }
  return results;
}

function parseDiaryJson(text) {
  let t = String(text || '').trim();
  t = t.replace(/```json/gi, '').replace(/```/g, '');
  if (!t.includes('"npcs"')) t = '{"npcs":[' + t;
  t = sanitizeJsonString(t);
  try { const obj = JSON.parse(t); if (Array.isArray(obj.npcs) && obj.npcs.length) return obj.npcs; } catch (_) {}
  const key = t.indexOf('"npcs"');
  const arrIdx = t.indexOf('[', key >= 0 ? key : 0);
  const npcs = scanObjects(t, arrIdx >= 0 ? arrIdx + 1 : 0).filter(o => o && o.name);
  if (npcs.length) return npcs;
  throw new Error('Phân tích JSON nhật ký thất bại, nguyên văn: ' + String(text).slice(0, 150));
}

function parseRelationJson(text) {
  let t = String(text || '').trim();
  t = t.replace(/```json/gi, '').replace(/```/g, '');
  if (!t.includes('"relations"')) t = '{"relations":[' + t;
  t = sanitizeJsonString(t);
  try { const obj = JSON.parse(t); if (Array.isArray(obj.relations)) return obj.relations; } catch (_) {}
  const key = t.indexOf('"relations"');
  const arrIdx = t.indexOf('[', key >= 0 ? key : 0);
  const rels = scanObjects(t, arrIdx >= 0 ? arrIdx + 1 : 0).filter(o => o && o.from && o.to);
  if (rels.length) return rels;
  throw new Error('Phân tích JSON quan hệ thất bại, nguyên văn: ' + String(text).slice(0, 150));
}