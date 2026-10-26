# LIWE · Engine ký ức RAG (Nhật ký nhân vật / Character Diary)

> 🇻🇳 **Bản dịch tiếng Việt.** Đây là bản sao được dịch sang tiếng Việt từ dự án gốc
> [zhaoyichan/SillyTavern-Plugin-HCDiary](https://github.com/zhaoyichan/SillyTavern-Plugin-HCDiary),
> đã được tác giả gốc cho phép. Toàn bộ giao diện, chú thích mã, nhật ký log và các prompt gửi cho AI
> đều đã được dịch sang tiếng Việt; mọi bản quyền về ý tưởng và mã nguồn thuộc về tác giả gốc.
> Các trình phân tích (regex) vẫn nhận cả nhãn tiếng Trung lẫn tiếng Việt, nên dữ liệu cũ vẫn đọc được.

Một **extension quản lý ký ức cốt truyện cho SillyTavern (ST)** rất mạnh. Cốt lõi là hai hệ thống ký ức tự động **Nhật ký nhân vật** và **Hồ sơ cốt truyện**, cộng thêm tiêm ký ức bằng truy xuất vector, giúp nhân vật AI của bạn thật sự “nhớ” câu chuyện — chuyện hôm nay, phục bút cài từ mấy hôm trước, thái độ và mối ràng buộc của bạn với từng nhân vật, đều không bị quên. Ngoài ra còn có một bộ module giải trí giúp nhân vật “sống dậy” (đĩa lưu game / Diễn đàn Thế giới / tạo ảnh thật / tiểu kịch trường...).

> Tên khác: HCDiary · `character-diary` · LIWE · Engine ký ức RAG
> Môi trường chạy: SillyTavern / Tauri Tavern (client Android)
> Phiên bản hiện tại: v2.17.0

---

## 🧠 Cốt lõi · Engine ký ức tự động

Sau mỗi lần AI trả lời, plugin tự phân tích phần cốt truyện mới, lắng đọng những gì vừa xảy ra thành **ký ức dài hạn**, và tiêm lại vào hội thoại khi cần, để AI nhớ được, trả lời đúng.

| Module | Mô tả |
|------|------|
| 📜 **Hồ sơ cốt truyện** | Tự duy trì tuyến chính / tuyến phụ / trạng thái / việc chưa giải quyết + mục theo dõi tùy chỉnh, xâu chuỗi mạch truyện (xem bên dưới) |
| 📖 **Nhật ký nhân vật** | Viết nhật ký riêng tư ngôi thứ nhất “như người sống” cho mỗi nhân vật có vai diễn, ghi tâm trạng/thái độ/tiếng lòng/sự kiện then chốt (xem bên dưới) |
| 🧠 **Truy xuất ký ức RAG** | Vector hóa nhật ký + hồ sơ, chỉ tiêm những hồi ức liên quan, không nhồi cả khối ngữ cảnh cho AI |
| 🔗 **Mạng quan hệ nhân vật** | Trích xuất quan hệ chủ quan một chiều giữa các nhân vật (thân thiện/bài xích/trung lập), tự tiến hóa theo cốt truyện |

---

## 📜 Hồ sơ cốt truyện

Sắp xếp mạch truyện rải rác trong từng câu thoại thành **mạch cốt truyện** có thể xem lại, viết tiếp.

- **Cấu trúc nhiều ô**: tuyến chính / tuyến phụ / trạng thái quan trọng / việc chưa giải quyết + mục theo dõi bạn tự định nghĩa (như thực lực, trang bị, manh mối nhân vật quan trọng...).
- **Thêm tăng dần**: có cốt truyện mới thì **thêm vào**, không bao giờ cắt xén ghi đè những gì đã xảy ra.
- **Chế độ dòng thời gian**: tuyến chính/tuyến phụ/trạng thái hiển thị phân loại theo dấu 【thời gian】, nhìn là hiểu; xóa hàng loạt nhiều dòng ổn định.
- **Tự nén “thu gọn không cắt chi”**: khi cốt truyện dồn quá nhiều có thể nén một chạm — mọi **chuyện đã xảy ra dù nhỏ đến đâu cũng không mất**, chỉ tinh gọn mô tả thừa, độ dài mục tiêu khoảng một nửa nguyên văn.
- **Việc chưa giải quyết ghi đè thật**: AI thấy đã xong thì xóa, không còn càng dồn càng nhiều.
- **Mục theo dõi tùy chỉnh**: tùy ý tạo trường bạn muốn theo dõi, AI liên tục ghi chép vào đó.

---

## 📖 Nhật ký nhân vật

Viết “nhật ký của con người” cho các nhân vật trong mỗi cảnh, chứ không phải bản ghi lạnh lùng.

- **Nhật ký riêng tư như người sống**: lời trong lòng ngôi thứ nhất, giãi bày thẳng thắn + tương phản ngây ngô (hơi thở người sống), như một con người thật viết lúc nửa đêm, chứ không phải báo cáo cốt truyện.
- **Lệnh cấm toàn tri**: chỉ viết những gì nhân vật tự trải qua và đang biết, tránh “góc nhìn thượng đế” tiết lộ tương lai.
- **Phản ứng cảm xúc thực tế**: những chuyện then chốt chạm đến nhân vật sẽ được viết thành phản ứng thật theo tính cách — đổi cách nhìn, ghi thù, rung động, sợ hãi muộn, biết ơn, than vãn, đều có thể là suy nghĩ lúc đó của họ.
- **Hai mức đơn giản / phức tạp**: bản gọn dưới trăm chữ chỉ viết tiếng lòng + chuyện quan trọng nhất + điểm ghi nhớ; bản phức tạp trải ra 300~520 chữ. Cùng một cách viết có hơi người, chỉ khác số chữ.
- **Vòng lặp ký ức**: có thể liên kết các điểm ký ức từ những bài trước, cho nhật ký có “cảm giác thời gian”.

---

## 🎯 Truy xuất và tiêm ký ức

- **Truy xuất vector RAG**: vector hóa hồ sơ cốt truyện / nhật ký nhân vật, trúng hồi ức liên quan mới tiêm, không nhồi cả khối ngữ cảnh cho AI.
- **Xếp hạng lại Rerank**: dùng endpoint `/rerank` tương thích OpenAI để xếp lại kết quả, thất bại thì tự hạ cấp (không chặn luồng chính).
- **Tiêm theo nhân vật xuất hiện**: regex nhận diện nhân vật xuất hiện trong cốt truyện, chỉ đẩy nhật ký gần đây của họ, chính xác mà không dư thừa.
- **Vị trí tiêm tùy chọn**: đầu / giữa hội thoại / cuối.
- **Ký ức chọn lọc (danh sách trắng)**: chỉ ghi “nhân vật trọng điểm”, tránh vai phụ không liên quan dồn đống.
- **API một đường gộp + prompt động**: nhật ký nhân vật / hồ sơ cốt truyện gộp thành một lần gọi, prompt ghép động theo các module bạn chọn (tiết kiệm token, nhanh hơn); quan hệ nhân vật bật tắt riêng được.
- **Tóm tắt tinh gọn (tiết kiệm token)**: khi tóm tắt mặc định chỉ gửi các tầng cần tóm tắt, không kèm nhật ký/hồ sơ/sổ thế giới lịch sử; muốn ngữ cảnh lịch sử thì bật thủ công “Tiêm lịch sử khi tóm tắt” trong cài đặt.
- **Bảo vệ dữ liệu**: phát hiện nhật ký giảm đột ngột sẽ tự khôi phục từ bản sao lưu cục bộ, chống mất ký ức.
- **Di chuyển toàn bộ**: xuất/nhập lịch sử trò chuyện + hồi ức plugin một chạm, đổi thiết bị không mất ký ức.

---

## 🎲 Các module giải trí khác

Ngoài ký ức, plugin còn kèm cả bộ cách chơi tùy chọn giúp nhân vật “sống dậy”, muốn dùng cái nào bật cái đó:

| Module | Một câu |
|------|--------|
| 🎮 **Đĩa lưu game** | Lưu kiểu RPG: chụp nhanh theo nhân vật, đánh sao ghim, lưu nhanh từ mỗi tin nhắn, xuất zip/nhập, quay về bất cứ lúc nào (v2.16+) |
| 🌐 **Diễn đàn Thế giới · Cộng đồng xuyên thế giới** | Nhân vật của các thế giới truyện khác nhau đăng bài, bình luận qua lại, ghen tuông xuyên thế giới, phong cách bài hot diễn đàn |
| 🎨 **Tạo ảnh thật** | Thư viện ảnh/album/xem ảnh, 12 bộ phong cách vẽ, prompt chỉnh sửa được, để nhân vật “được nhìn thấy” |
| 🎭 **Tiểu kịch trường** | Để AI trình diễn một đoạn cốt truyện/cảnh thành một màn biểu diễn nhập vai, có thể lưu lại |
| 🔔 **Âm báo trả lời** | AI trả lời xong/tóm tắt xong tự reo chuông, tùy chỉnh âm thanh và thời điểm kích hoạt |
| 📋 **Bảng tình báo LIWE** | Điền bảng trạng thái/lý lịch nhân vật tùy chỉnh, tự chụp nhanh quá trình tiến hóa |
| 🔎 **Điều hướng chương hồi** | Tự tạo tiêu đề chương hồi, lật xem phiên bản lịch sử |
| 📚 **Liên động sổ thế giới** | Chuẩn hóa ký tự biệt danh, trúng chính xác mục sổ thế giới gắn với nhân vật gốc |

> Còn một loạt “phù khế” vui: xúc xắc vận mệnh, engine hảo cảm, bình luận chạy (đạn mạc), phục bút, thế giới song song, tạo front-end..., là “Đài tiêm nghi thức” độc lập có thể bật thủ công (xem trong plugin).

---

## 📥 Cài đặt

```bash
cd SillyTavern/extensions/
git clone https://github.com/SolNg/liwe-memory.git character-diary
```

Hoặc trong SillyTavern: **Extensions → Install extension**, dán `https://github.com/SolNg/liwe-memory`.

Khởi động lại SillyTavern, rồi bấm “Nhật ký nhân vật” trong menu extension để dùng.

---

## 🚀 Bắt đầu nhanh

1. Thanh trượt góc trên phải vào **Cài đặt**, cấu hình nguồn API (mặc định theo SillyTavern).
2. Trò chuyện bình thường, sau khi AI trả lời plugin tự viết nhật ký, cập nhật hồ sơ cốt truyện (hoặc bấm “Viết nhật ký” thủ công).
3. “Duyệt” để xem nhật ký nhân vật; “Dòng thời gian” để xem tiến hóa hồ sơ cốt truyện; “Quan hệ” để xem mạng quan hệ nhân vật.
4. Chơi đủ tuyến chính rồi thì vào “Lưu trữ” lưu một bản, vào “Diễn đàn” để nhân vật các thế giới qua lại tương tác.
5. Bảng “Nhật ký log” xem được token và chi phí của mỗi lần gọi.

---

## 💾 Lưu trữ dữ liệu

- Nhật ký / quan hệ / hồ sơ cốt truyện lưu trong `chatMetadata.extensions['character-diary']` của ST, tự lưu theo cuộc trò chuyện, có Chat Variables làm đường dự phòng thứ hai.
- Bản lưu nằm trong IndexedDB (`cd-save-db`), tạm biệt giới hạn dung lượng localStorage.
- Thế giới/bài viết/nhân vật/danh hiệu của Diễn đàn Thế giới lưu trong localStorage (`cd-forum-data`), đổi thẻ không mất.
- Có thể dùng “Di chuyển toàn bộ” khi đổi thiết bị để chuyển trọn ký ức.

> ⚠️ Lưu ý cho người dùng chuyển từ bản gốc tiếng Trung: một số khóa dữ liệu nội bộ (ví dụ tên phiên trợ lý nhỏ, nhãn trạng thái nhóm chat) đã được dịch, nên một vài lịch sử điện thoại/nhóm chat của bản gốc có thể không hiện lại. Nhật ký, quan hệ và hồ sơ cốt truyện không bị ảnh hưởng.

---

## 🙏 Ghi công

- Tác giả gốc: **zhaoyichan** — [SillyTavern-Plugin-HCDiary](https://github.com/zhaoyichan/SillyTavern-Plugin-HCDiary)
- Bản dịch tiếng Việt: **SolNg** — [liwe-memory](https://github.com/SolNg/liwe-memory), được thực hiện với sự cho phép của tác giả gốc.

*Sẽ tiếp tục cập nhật theo các phiên bản plugin.*
