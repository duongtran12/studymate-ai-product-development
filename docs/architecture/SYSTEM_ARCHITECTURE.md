# StudyMate System Architecture

## Muc tieu Chương 5

Kien truc MVP bien giao dien prototype thanh mot he thong co API va du lieu that, nhung van tach ro cac module de co the them xu ly tai lieu va RAG o chuong sau.

## So do thanh phan

```text
React + Vite client
        |
        | HTTPS / JSON REST
        v
Spring Boot API
  |- Auth module
  |- Course module
  |- Document module
  |- Study session + grounded chat module
  `- Quiz module
        |
        v
PostgreSQL

Document storage / extraction worker / vector search
(duoc them sau MVP core API)
```

## Nguyen tac thiet ke

- Frontend chi giao tiep voi backend qua REST API; khong truy cap PostgreSQL truc tiep.
- Moi tai nguyen nghiep vu deu gan voi `user_id`; service la noi kiem tra quyen so huu.
- Controller chi xu ly HTTP va validation. Service chua quy tac nghiep vu. Repository thuc hien truy van du lieu.
- Migration Flyway la nguon su that cho schema, duoc chay tu dong khi khoi dong ung dung.
- Module chat luu session va message doc lap voi AI provider. Cac buoc trich xuat, retrieval va sinh cau tra loi se duoc them sau ma khong doi API cong khai.

## Bien gioi module MVP

| Module | Trach nhiem hien tai | Mo rong sau nay |
| --- | --- | --- |
| Auth | Tai khoan, dang nhap, phan quyen | JWT, refresh token, email verification |
| Course | CRUD mon hoc cua nguoi dung | Thanh vien va chia se mon hoc |
| Document | Metadata va tai file | OCR, chunking, index vector |
| Study session | Luu phien hoc va hoi thoai | RAG, citation thuc, streaming |
| Quiz | Cau hoi va ket qua lam bai | Sinh quiz tu tai lieu |

## Quy uoc API

- Base path: `/api/v1`.
- Tra ve JSON, dung HTTP status phu hop.
- Doi tuong request/response khong de lo entity database truc tiep.
- Loi validation tra ve `400`; khong tim thay tai nguyen tra ve `404`; truy cap khong duoc phep tra ve `403`.
