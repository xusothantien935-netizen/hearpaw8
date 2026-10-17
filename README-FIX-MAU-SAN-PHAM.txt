HearPaw - fix lỗi chọn màu nhưng ảnh không đổi

Nguyên nhân tìm thấy trong source ZIP:
- assets/collar2-red.webp
- assets/leash2-butter.webp
- assets/leash2-red.webp

Ba file trên trong ZIP ban đầu chỉ có 2 byte, không phải ảnh WebP hợp lệ. Vì vậy trình duyệt không tải được ảnh màu và script rơi về ảnh -main.webp.

Đã cập nhật script.js để thử lần lượt các định dạng WebP/PNG/JPG theo màu, sau đó mới fallback về ảnh chính, và ghi cảnh báo trong Console nếu ảnh biến thể chưa có.

CẦN LÀM ĐỂ ẢNH THẬT ĐỔI MÀU:
Đưa ảnh sản phẩm biến thể thật vào thư mục assets/ với đúng tên:
- collar2-red.webp (Vòng cổ thông minh Gen2 màu đỏ)
- leash2-butter.webp (Dây dắt da mềm màu vàng bơ)
- leash2-red.webp (Dây dắt da mềm màu đỏ)

Có thể dùng PNG/JPG thay thế nếu đổi đúng phần mở rộng trong tên file. Không chỉ đổi tên ảnh chính thành tên màu vì ảnh vẫn giữ nguyên màu cũ.
