# 📘 Nhật ký nhân vật (HCDiary) · Tài liệu trung tâm phát triển

> 🇻🇳 Bản dịch tiếng Việt của tài liệu phát triển gốc (dự án gốc: `github.com/zhaoyichan/SillyTavern-Plugin-HCDiary`, bản dịch: `github.com/SolNg/liwe-memory`). Các đường dẫn, lệnh và lịch sử commit bên dưới là của dự án gốc, được giữ nguyên để tham khảo.

> **Tài liệu này là lối vào tổng hợp một cửa cho mọi việc bảo trì/phát triển plugin HCDiary sau này. Khi một cuộc hội thoại mới tiếp quản, hãy đọc tài liệu này trước.**
> Cập nhật lần cuối: 2026-08-21
> Phiên bản hiện tại: v2.7.5 (bao gồm lần sửa “sau khi nén thủ công thì tuyến chính/tuyến phụ biến mất”)

---

## 📚 Giới thiệu tài liệu (hội thoại mới bắt buộc đọc)

**File này là tài liệu chính duy nhất**, đã tích hợp nội dung cốt lõi của các file md rải rác trước đây trong vùng công cụ (hướng dẫn phát triển, liên động sổ thế giới, ghi nhớ quy trình, trung tâm phát triển, tổng kết đài nghi thức, kinh nghiệm hảo cảm âm). **Hội thoại mới tiếp quản chỉ cần đọc file này**, không cần lật lại các md cũ. Các file md rải rác cũ được giữ làm tham khảo lịch sử, nhưng **mọi thứ lấy file này làm chuẩn**; mọi thay đổi sau này đều ghi vào mục sáu “Nhật ký thay đổi” của file này.

---

## ⚠️ Một câu gửi AI tiếp quản (nhất định đọc trước)

**Người dùng là “người mới hoàn toàn về phát triển plugin”** — mô tả của họ thường mơ hồ, theo trực giác, khẩu ngữ, thậm chí mâu thuẫn trước sau (ví dụ “trước đây được mà” có thể chỉ một phiên bản cũ từ rất lâu). **Khi nhận yêu cầu đừng chỉ hiểu theo mặt chữ, phải chủ động suy luận mở rộng xem họ thật sự muốn gì, vấn đề thật sự nằm ở đâu**, khi cần thì liệt kê để làm rõ rồi mới động tay. Nhưng cũng phải **kiềm chế**: chưa có bằng chứng thì tuyệt đối không đoán bừa, tuyệt đối không làm hỏng chức năng đang chạy được.

---

## Một, dự án là gì

- Tên plugin: **Nhật ký nhân vật (Character Diary)**, tên khác HCDiary / `character-diary` / LIWE · Engine ký ức RAG
- Loại: **Extension cho SillyTavern (ST)**, chạy trên client **Tauri Tavern** (Android)
- Kho mã gốc: `github.com/zhaoyichan/SillyTavern-Plugin-HCDiary` (bản dịch: `github.com/SolNg/liwe-memory`)
- Chức năng: tự viết nhật ký ngôi thứ nhất cho nhân vật trong cốt truyện, duy trì mạng quan hệ nhân vật, lắng đọng hồ sơ cốt truyện, truy xuất vector + Rerank, tiêm ký ức, điền bảng, tiêm nghi thức, di chuyển toàn bộ
- Kiến trúc: **một file duy nhất `index.js`** (trường `js` của manifest.json chỉ tải nó); `data.js`/`engine.js`/`api.js`/`prompts.js`/`constants.js` chỉ là các lát mã nguồn (nay nằm trong `_legacy_unused/`), **sửa chúng không có tác dụng, bắt buộc phải sửa `index.js`**

## Hai, thư mục chạy thật (lưu trữ dữ liệu)

```
/storage/emulated/0/Android/data/com.tauritavern.client/data/extensions/third-party/SillyTavern-Plugin-HCDiary/
```

- `index.js` thật sự được ST tải nằm ở đây
- **Cách truy cập**: `super_admin:shell` (Shizuku/Root) đọc ghi được Android/data; `terminal`/proot **không đọc được** (Permission denied)
- **Quy trình**: sửa xong file → đặt vào vùng chia sẻ (như `/sdcard/Download/`) → dùng `shell` `cp` vào thư mục thật → **khởi động lại hoàn toàn SillyTavern** mới có hiệu lực
- Bản sao phát triển (thư mục này): `/storage/emulated/0/Download/酒馆插件开发/角色日记/SillyTavern-Plugin-HCDiary-main/index.js`

## Ba, quy trình sửa đổi chuẩn (mỗi lần sửa code đều làm theo)

1. **Sao lưu trước**: `shell` trong thư mục thật `cp index.js index.js.bak_<lý do>_<dấu thời gian>`
2. **Sửa bản sao phát triển**: `Download/酒馆插件开发/角色日记/SillyTavern-Plugin-HCDiary-main/index.js` (dùng edit_file / thay thế chính xác bằng Python)
3. **Kiểm tra cú pháp**: trong `super_admin:terminal` chạy `node --check index.js` (bắt buộc SYNTAX_OK)
4. **Đồng bộ vào thư mục chạy**: `shell` `cp bản sao phát triển index.js` (thư mục thật)
5. **Khởi động lại SillyTavern**: `shell` `am force-stop com.tauritavern.client && am start -n com.tauritavern.client/.MainActivity` (bắt buộc khởi động lại hoàn toàn, không phải làm mới)
6. **Sửa xong bắt buộc thêm một mục vào “Nhật ký thay đổi” của tài liệu này** (xem mục sáu, đây là quy định cứng!)

## Bốn, phát hành lên GitHub (quy trình chuẩn sau v2.7.5)

1. Trong terminal Ubuntu dùng **Contents API** cập nhật file (file lớn base64 thẳng + PUT):
   - Trước tiên `GET contents/index.js` lấy sha hiện tại
   - Dùng `python3` cục bộ đọc file → base64 → dựng payload `{message, content, sha}` → `PUT`
   - Payload file lớn ghi vào `/tmp` rồi dùng `curl -d @payload`, tránh dòng lệnh quá dài
2. **Cập nhật tag**: dùng `PATCH /git/refs/tags/v2.7.x` (`force:true`) chuyển tag `v2.7.x` sang commit mới, đảm bảo Release lấy bản mới nhất
3. **Kiểm chứng**: kéo lại từ GitHub bằng `GET contents`, `node --check` + `grep` dấu then chốt, xác nhận số byte khớp với bản cục bộ
4. **Dọn dẹp**: xóa payload tạm / file kiểm chứng; sau khi dùng token thì nhắc đổi token

> Số phiên bản đồng bộ 4 chỗ: `PLUGIN_VERSION` + dòng `SillyTavern 插件 · vX.Y.Z` ở đáy UI + `manifest.version` + mục mới đầu tiên trong CHANGELOG (đừng phá dấu đóng `];`)

## Năm, thu hoạch cốt lõi của phiên này (2026-08-21, v2.7.5)

### 1. Sự thật về “nén hồ sơ cốt truyện thủ công mà như không có tác dụng”
- **Hiện tượng**: sau khi nén thủ công có in “Nén gộp hồ sơ cốt truyện hoàn tất”, nhưng số ký tự tiêm không nhúc nhích (15550), tưởng là chưa nén.
- **Sự thật**: chức năng nén **vốn chạy tốt**. Log “nén gộp hoàn tất” in ở đường thành công của callback nút, **chỉ chứng minh hàm không ném lỗi, không chứng minh nội dung thật sự được thay**. Thứ thật sự chứng minh “thay thành công” là log `Tự nén xx: cũ→mới chữ` trong `cdCompressArchive` — trong code cũ **khi nén thất bại không in log “tự nén” nào, chỉ lặng lẽ in một câu “hoàn tất”**, tạo ra ảo giác “chức năng hỏng”.
- **Bài học**: **log “hoàn tất” ≠ “có hiệu lực”**. Muốn xét chức năng có thật sự hiệu lực, phải xem log chứng minh được “dữ liệu thật sự đã ghi”, chứ không phải câu kết thúc quy trình.

### 2. Nguyên nhân gốc và cách sửa “giao diện cốt truyện không thấy tuyến chính/tuyến phụ” (phương án 3, đã phát hành)
- **Nguyên nhân gốc**: `cdRenderArchive` của giao diện cốt truyện có hai đường hiển thị:
  - Chế độ dòng thời gian: `extractTimelineItems` **chỉ nhận dòng sự kiện “bắt đầu bằng 【thời gian】”** (`^【xx】nội dung`)
  - Chế độ fallback: khi không có dấu 【thời gian】 nào, hiển thị thẻ đoạn văn
- **Điểm chết người**: chỉ cần **một trường** (như “chưa giải quyết”) còn sót dấu 【thời gian】 là cả trang đi chế độ dòng thời gian; mà “tuyến chính/tuyến phụ” sau khi nén là **tường thuật thuần, không có dấu 【thời gian】** → bị `if (!cat.items.length) continue;` bỏ qua cả nhóm → **tuyến chính/tuyến phụ biến mất**.
- **Sửa (phương án 3 = trị tận gốc + dự phòng)**:
  - **Sửa prompt nén**: bắt buộc “【dấu thời gian】 phải giữ nguyên dạng, mỗi sự kiện vẫn bắt đầu bằng 【thời gian】, mỗi mục một dòng; không được xóa sửa/gộp dấu thời gian, không được viết lại thành tường thuật liền mạch không thời gian” → sau này nén tuyến chính/tuyến phụ vẫn giữ cấu trúc thời gian
  - **Sửa dự phòng hiển thị**: trong chế độ dòng thời gian, với nhóm “không có dấu thời gian nhưng có văn bản”, đổi sang hiển thị thẻ đoạn văn (không continue bỏ qua nữa) → dù định dạng nào tuyến chính/tuyến phụ cũng thấy được
- **Triển khai**: GitHub main = commit `ef6a9273`, tag v2.7.5 đã cập nhật trỏ tới commit đó, index.js (656269 byte, có chẩn đoán COMPRESS-DIAG).

### 3. Thêm log chẩn đoán (COMPRESS-DIAG) để thu bằng chứng
- `[COMPRESS-DIAG] Phản hồi gốc của AI`: `res.text` có không, dài bao nhiêu, 200 chữ đầu
- `[COMPRESS-DIAG] Kết quả phân tích out`: mỗi trường phân tích ra bao nhiêu chữ
- `[COMPRESS-DIAG] Điền lại thành công/đã thay N trường`: thực tế ghi bao nhiêu trường
- Phương án B: nén thất bại thì `throw` báo lỗi rõ ràng (không giả vờ thành công nữa)

### 4. Lắng đọng phương pháp luận (quan trọng nhất)
- **Tư duy mở rộng**: người dùng mới mô tả mơ hồ, phải chủ động dò mọi dữ liệu hệ thống liên quan, **nghiêm cấm đoán bừa không bằng chứng**.
- **Không vượt quyền**: người dùng nói “cho phương án” thì chỉ cho phương án, đừng sửa thẳng; người dùng nói “thêm log chẩn đoán” thì chỉ thêm log, đừng tiện tay viết lại logic.
- **“Trước đây được” thì phải hỏi kỹ**: là “lần này không được” hay “rất lâu trước kia thì được”? Đừng vì một câu “trước đây được” mà đi sửa một bộ phân tích vốn không có vấn đề.
- **Dùng luồng dữ liệu để kiểm chứng ngược**: giao diện sai → lưu trữ đúng → nguồn (prompt/tầng tạo) là đáng nghi nhất. Tham khảo ca “sửa hảo cảm âm”.
- **Sửa xong node --check + grep chuỗi then chốt để xác nhận + cp sao lưu + khởi động lại hoàn toàn**.

---

## Sáu, 📝 Nhật ký thay đổi (quy định cứng: sau này mỗi lần thay đổi bắt buộc thêm ghi chép ở đây)

> **Quy tắc**: bất kỳ ai (kể cả AI hội thoại mới) sửa `index.js` / `style.css` / `manifest.json` hoặc phát hành phiên bản, **đều bắt buộc thêm một mục ở mục này**, theo định dạng dưới. Không ghi nhật ký = thay đổi chưa tính là hoàn thành.

### Mẫu định dạng
```
#### YYYY-MM-DD · vX.Y.Z
- File thay đổi: index.js
- Nội dung thay đổi: ...
- Nguyên nhân/động cơ: ...
- Kiểm chứng: node --check ✅ / grep chuỗi then chốt ✅ / bản chạy đã đồng bộ ✅ / SillyTavern đã khởi động lại ✅
- Thư mục chạy: /storage/emulated/0/Android/data/com.tauritavern.client/data/extensions/third-party/SillyTavern-Plugin-HCDiary/
- GitHub: commit xxx / tag vX.Y.Z đã cập nhật
- Sao lưu: index.js.bak_xxx
```

### Ghi chép lịch sử

#### 2026-10-26 · Bản dịch tiếng Việt (SolNg/liwe-memory)
- File thay đổi: index.js, style.css, manifest.json, README.md, DEVELOPMENT.md, assets/charimages.js, _legacy_unused/*.js
- Nội dung thay đổi: dịch toàn bộ giao diện, chú thích, log, prompt AI sang tiếng Việt; các regex phân tích được mở rộng để nhận cả nhãn tiếng Trung lẫn tiếng Việt; kiểm tra cập nhật trỏ sang `SolNg/liwe-memory`; bộ lọc thẻ tạo ảnh loại cả chữ Latin có dấu.
- Kiểm chứng: node --check ✅

#### 2026-08-21 · v2.7.5 (phiên này)
- File thay đổi: index.js
- Nội dung thay đổi:
  1. Prompt nén của `cdCompressArchive` bắt buộc giữ cấu trúc 【dấu thời gian】 (mỗi sự kiện vẫn bắt đầu bằng 【thời gian】, mỗi mục một dòng, không được viết lại thành tường thuật liền mạch không thời gian)
  2. Chế độ dòng thời gian của `cdRenderArchive` thêm dự phòng: trường không có dấu 【thời gian】 nhưng có văn bản (tuyến chính/tuyến phụ) hiển thị bằng thẻ đoạn văn, không bị bỏ qua nữa
  3. `cdCompressArchive` thêm log chẩn đoán COMPRESS-DIAG (phản hồi gốc AI/kết quả phân tích/điền lại thành công) + thất bại thì throw (phương án B)
- Nguyên nhân/động cơ: sau khi nén thủ công, tuyến chính/tuyến phụ biến mất khỏi giao diện cốt truyện (nén làm cấu trúc có dấu 【thời gian】 thành tường thuật thuần, mà các trường như “chưa giải quyết” còn sót dấu thời gian khiến cả trang đi chế độ dòng thời gian, tuyến chính/tuyến phụ tường thuật thuần bị lọc mất)
- Kiểm chứng: node --check ✅ / grep “【dấu thời gian】 phải giữ nguyên dạng”=1, “dự phòng thẻ đoạn văn”=1, COMPRESS-DIAG=4 ✅ / bản chạy đã đồng bộ ✅ / SillyTavern đã khởi động lại ✅
- GitHub: commit ef6a9273 / tag v2.7.5 đã cập nhật ✅
- Sao lưu: index.js.bak_compressdiag_*

#### 2026-08-20 · v2.7.5 (phiên trước, khóa ngay khi bắt)
- File thay đổi: index.js
- Nội dung thay đổi: phương án A trị tận gốc “tóm tắt lặp các tầng cũ do kích hoạt từ nhiều lối vào”:
  - FIX-1 khóa ngay khi bắt (chọn tầng xong lập tức ghi vào processedFloors)
  - FIX-3 căn ba con trỏ (lastFloor/_lastDiaryChatLength/_baselineChatLength)
  - FIX-2 thất bại thì rollback + đường thành công xóa dấu khóa (window.__cdLockedBatch)
- Kiểm chứng: node --check ✅ / bản chạy đồng bộ ✅ / SillyTavern khởi động lại ✅
- GitHub: commit 3db4f51 / tag v2.7.5

---

## Bảy, hồ sơ kỹ thuật cốt lõi (mô hình dữ liệu / cơ chế vận hành)

### 1. Lưu trữ dữ liệu (object `data` cốt lõi)
Toàn bộ lưu trong `chatMetadata.extensions['character-diary']` của ST (PLUGIN_ID=`character-diary`). Lối vào thống nhất: `cdGetData()` đọc, `cdSaveData(data)` ghi. Cấu trúc (định nghĩa trong `emptyData()`):
```js
{
  diaries: {},        // nhật ký nhân vật { tên nhân vật: [{turn,date,entry,mood,attitude_to_user,secret,key_events,relationship_with_others,message_id}] }
  aliases: {},        // biệt danh nhân vật { tên nhân vật: [biệt danh...] }
  cameo: {},          // số lần người qua đường xuất hiện
  promoted: {},       // có phải nhân vật chính thức không
  relations: {},      // quan hệ nhân vật { from: { to: {type,attitude,note} } }
  lastFloor: -1,      // message_id của tầng cuối đã xử lý
  _baselineChatLength: -1,
  _lastDiaryChatLength: 0,
  processedFloors: [],// các tầng đã xử lý (dấu khóa ngay khi bắt)
  archive: { mainline, sideline, states, unresolved, custom:{} },  // hồ sơ cốt truyện (kiểu thêm vào)
  cards: [], archiveVectors: [], diaryVectors: [], liveTableData: [], liveTableSnapshots: [],
}
```
- `archive.mainline/sideline/states/unresolved` = văn bản kiểu thêm vào (nối bằng `\n\n`); `archive.custom[key]` = mảng kiểu thêm vào `[{time,desc}]`
- `diaries[nhân vật]` = mảng kiểu thêm vào, mỗi mục có `message_id` (dùng để loại trùng/định vị)

### 2. Đường lưu (then chốt)
- **Bắt buộc** `ctx.chatMetadata.extensions[PLUGIN_ID]` + gọi `saveChat` mới thật sự ghi đĩa
- Thứ tự ưu tiên lưu (bỏ break, thực hiện tất cả): `ctx.saveChat` → `window.saveChatConditional` → `window.saveChat` → `ctx.saveMetadata` → `window.saveMetadataDebounced`
- Dự phòng: `insertOrAssignVariables({[PLUGIN_ID]:data},{type:'chat'})` đường thứ hai
- Thứ tự đọc của `cdGetData`: chatMetadata.extensions → cấp cao nhất chatMetadata → Chat Variables

### 3. Cơ chế vận hành (quy trình then chốt)
- **Kích hoạt tự động**: lắng nghe `MESSAGE_RECEIVED` (sau khi AI trả lời) → `cdOnMessageReceived` dùng `_baselineChatLength`/`data.lastFloor` xét tầng mới, đủ `interval` (mặc định 5) thì kích hoạt → `cdRunDiary`
- **Luật sắt kích hoạt tự động (v2.7.5 khóa ngay khi bắt)**: chọn tầng xong lập tức ghi vào `processedFloors` và lưu (không chờ AI trả về), chặn hẳn “chọn xong thì crash → tầng cũ tái phát”; căn ba con trỏ (lastFloor/_lastDiaryChatLength/_baselineChatLength); thất bại thì rollback, thành công thì xóa khóa (window.__cdLockedBatch)
- **Viết nhật ký ba đường song song**: `cdRunDiary` gọi đồng thời nhật ký/quan hệ/hồ sơ, mỗi đường độc lập, thất bại không ảnh hưởng nhau
- **Tiêm (cốt lõi)**: lắng nghe `CHAT_COMPLETION_PROMPT_READY`, trước khi tạo thao tác thủ công mảng `eventData.chat` để chèn nội dung tiêm theo “đầu/giữa hội thoại/cuối” (`cdBuildDiaryInjectionText`); số vai 0=system/1=user/2=assistant
- **Vector + Rerank**: `cdSearchVectors` truy hồi → `cdRerankResults` xếp lại (`/rerank` tương thích OpenAI, thất bại thì hạ cấp)
- **Điền bảng**: điều khiển bởi `liveTableEnabled/liveTableInject`

### 4. Các mục cài đặt then chốt (tóm tắt DEFAULT_SETTINGS)
`enabled` (công tắc chính, tắt = dừng tất cả) / `interval` (5) / `autoSummary` / `enableDiary|Relation|Archive` / `injectDiary|Relation|Archive` / `archiveMode` ('append'|'vector') / `diaryMode` / `vectorTopK` / `vectorThreshold` / `rerankEnabled` / `rerankApi` / `customFields` / `injectPosition` ('after'|'before'|'chat') / `autoCompress` / `autoCompressThreshold` / `liveTableEnabled|Inject`

## Tám, bảng tra nhanh các hàm then chốt

| Hàm | Tác dụng |
|---|---|
| `cdGetData()` / `cdSaveData(data)` | Đọc ghi data (lối vào duy nhất) |
| `cdRunDiary()` | Quy trình viết nhật ký chính (ba đường song song) |
| `cdOnMessageReceived` | Lối vào kích hoạt tự động (khóa ngay khi bắt) |
| `cdBuildDiaryPrompt` / `cdBuildRelationPrompt` / `cdBuildArchivePrompt` | Dựng prompt ba đường |
| `cdApiComplete(messages,s)` | Gọi LLM thống nhất (trả về `{text,elapsed,tokenUsage}`) |
| `cdParseCompressedBlocks` | Phân tích kết quả nén (chia đoạn theo 【tiêu đề】) |
| `cdCompressArchive` | Nén gộp hồ sơ cốt truyện (thủ công/tự động) |
| `cdRenderArchive` | Hiển thị dòng thời gian cốt truyện (tuyến chính/tuyến phụ/trạng thái/chưa giải quyết) |
| `cdBuildDiaryInjectionText` | Tạo nội dung tiêm |
| `cdOnBeforeGeneration` | Callback tiêm CHAT_COMPLETION_PROMPT_READY |
| `cdSearchVectors` / `cdRerankResults` / `cdRerank` | Truy hồi vector / xếp lại Rerank |
| `cdGetStCtx` / `_cdDoInit` / `cdInjectFab` | Khởi tạo / tiêm FAB |
| `cdSaveSettings` / `cdGetSettings` | Đọc ghi cài đặt |

## Chín, danh sách bẫy và lệnh cấm (bài học xương máu)

### Lưu trữ/dữ liệu
- Bắt buộc `saveChat` mới thật sự ghi đĩa, `saveMetadata` chưa chắc lưu bền (thoát phiên là mất dữ liệu)
- `cdGetData`/`cdSaveData` là lối vào đọc ghi duy nhất, thêm trường mới bắt buộc đồng bộ hai chỗ này
- Dữ liệu giảm đột ngột thì tự khôi phục từ bản sao lưu localStorage (bảo vệ dữ liệu)

### Sửa code
- **Tuyệt đối không dùng replace/re.sub chuỗi thuần để thay nội dung chứa `\n`**, tham số repl luôn dùng hàm (`lambda m:...`), tránh bị thoát lần hai rồi bung ra
- Thay JSON giữa các môi trường: tự dựng chữ `\n`, đừng tin hành vi của json.dumps/repr trong terminal
- Sửa xong bắt buộc `node --check` + `repr()` xem byte thật, đừng tin terminal hiển thị xuống dòng gây hiểu lầm
- Phân tích trường động thì “quét từng dòng” ổn định hơn regex không tham lam
- Ngoặc kép tiếng Trung/key tiếng Trung lẫn ngoặc kép nửa góc dễ lỗi cú pháp; dùng toàn góc/**书** an toàn hơn

### Môi trường ST
- API của ST phần lớn là `ctx.xxx` (saveChat/saveMetadata...), gọi toàn cục trần sẽ ReferenceError
- Vị trí tiêm dùng CHAT_COMPLETION_PROMPT_READY thao tác thủ công eventData.chat là ổn nhất, đừng phụ thuộc setExtensionPrompt
- Nút “không phản ứng” phần lớn do sự kiện mất hiệu lực sau khi render lại → dùng `onclick` nội tuyến gắn hàm toàn cục, hoặc ủy quyền `$('#cd-content').off('click',...).on('click',...)`
- Sửa file plugin trên đĩa xong bắt buộc khởi động lại hoàn toàn ST (force-stop + khởi động), chỉ làm mới không có tác dụng

### Bẫy ảnh chụp cài đặt người dùng
- Ảnh chụp cài đặt cũ của ST được ưu tiên hơn giá trị mặc định trong code (`Object.assign({},DEFAULT_SETTINGS,stored)`) → khi sửa code mà không có tác dụng, cung cấp nút “Khôi phục mặc định” để người dùng kéo về

### Phát hành
- Trước khi phát hành xác nhận bản cục bộ là tập cha đầy đủ của bản từ xa (so danh sách hàm), tránh ghi đè lùi phiên bản
- Số phiên bản đồng bộ 4 chỗ + đóng mảng CHANGELOG
- Mạng không ổn định, Release dùng GitHub API `POST /releases` (truyền tag_name + target_commitish=main) ổn nhất

### Phương pháp luận (quan trọng nhất, đọc nhiều lần)
- 🚫 Đừng tự soát lặp đi lặp lại ở tầng phân tích/hiển thị (chú thích đã ghi “tránh dấu âm bị nuốt” tức là đã xử lý rồi)
- ✅ Giao diện sai → lưu trữ đúng → nguồn (prompt/tầng tạo) đáng nghi nhất, kiểm chứng ngược theo luồng dữ liệu
- ⚠️ **Ví dụ trong prompt chính là quy tắc**: AI bắt chước ví dụ, ví dụ đầy đủ (dấu âm/dấu thời gian) thì AI mới xuất
- ⚠️ Đầu ra kiểu ghi đè dễ mất thông tin nhất (dấu âm/dấu thời gian) → bắt buộc yêu cầu giữ lại một cách tường minh
- 📌 Dữ liệu lịch sử không tự sửa, chỉ ảnh hưởng lần tạo/ghi đè tiếp theo
- 📌 Log “hoàn tất” ≠ “có hiệu lực”, phải xem log chứng minh được dữ liệu đã ghi

---

## Mười, tra nhanh theo chuyên đề chức năng

### Liên động sổ thế giới (biệt danh → chuẩn hóa tên chính)
- Vấn đề: tên hiển thị trong chat (biệt danh) ≠ tên chính logic của nhân vật → mục sổ thế giới (key là tên chính) không trúng
- Sửa: `cdSceneWorldbookRoles` dùng key của `data.diaries` + `data.aliases` (tên chính → [biệt danh]) dựng ánh xạ ngược “biệt danh → tên chính”, quy tên hiển thị của tầng về tên chính
- Ứng viên 3 dùng `async function` + `await loadWorldInfo` (ST bản mới trả về Promise); forEach đổi thành vòng for
- Đường dẫn sổ thế giới: `data/default-user/worlds/*.json`, cấu trúc `{entries:{'0':{...}}}`

### Hiển thị hảo cảm âm bị nuốt (v2.7.2)
- Tầng phân tích không có vấn đề, gốc bệnh ở **prompt trạng thái đưa cho AI** không bảo ghi số âm, ví dụ toàn số dương → AI lưu -90 thành 90
- Sửa: ví dụ trong prompt bổ sung `hảo cảm với nhân vật chính -90` + yêu cầu tường minh “hảo cảm âm bắt buộc giữ dấu âm”

### Đài tiêm nghi thức (v2.7.2)
- Mỗi “phù khế” = một module prompt cố định bật tắt được `{id,name,icon,enabled,desc,variant,position,texts}`
- Văn bản gốc siêu dài tách thành hằng số (đầu file), settings tham chiếu
- Tiêm dùng lại CHAT_COMPLETION_PROMPT_READY, nhóm theo position before/chat/after chèn độc lập
- Khi tiêm ký ức rỗng thì không return thẳng, chỉ bỏ qua ký ức và tiếp tục tiêm nghi thức
- Style động `document.createElement('style')` + giới hạn phạm vi `#cd-content`; tiền tố class `cd-rit-*`

### Ký ức chọn lọc (danh sách trắng)
- Khi `selectiveMemory:true` chỉ ghi focusRoles (nhân vật trọng điểm), còn lại bỏ qua
- Không phá hủy: chỉ chặn ghi nhân vật mới, không xóa ký ức cũ

### AI loại trùng
- Phát hiện các mục gần trùng ở mức ngữ nghĩa, bật hộp thoại xem trước rồi dọn, có thể khôi phục

---

*(Tài liệu này sẽ tiếp tục cập nhật theo việc bảo trì plugin. Mọi chức năng mới/bản sửa/bẫy đều bắt buộc đồng bộ vào chương tương ứng của tài liệu + nhật ký thay đổi.)*
