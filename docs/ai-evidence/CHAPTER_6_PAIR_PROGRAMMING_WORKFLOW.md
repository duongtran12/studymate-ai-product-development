# Chapter 6 AI Pair Programming Workflow

## Muc dich

Quy trinh nay quy dinh cach nhom StudyMate su dung Generative AI khi lap trinh. AI la cong cu de de xuat va giai thich code; thanh vien chiu trach nhiem kiem chung, sua va commit ket qua cuoi cung.

## Quy trinh cho mot commit

1. Doc user story, API contract va code lien quan truoc khi viet prompt.
2. Viet prompt co pham vi ro rang: muc tieu, file duoc phep sua, rang buoc bao mat va tieu chi nghiem thu.
3. Xem xet code AI de xuat; khong chap nhan tu dong cac thay doi ngoai pham vi.
4. Chinh sua de phu hop voi convention cua repo va kiem tra loi input, quyen so huu du lieu, null va loi HTTP.
5. Viet hoac cap nhat test cho hanh vi thanh cong, validation va truy cap trai phep.
6. Chay `./mvnw.cmd test`, `pnpm build` neu co thay doi frontend, va `git diff --check`.
7. Commit nho voi mot muc dich; ghi evidence de thanh vien khac co the review.

## Phan cong vai tro

- Nguoi thuc hien: dat prompt, danh gia de xuat cua AI, sua code va chay test.
- Nguoi review: doc diff, doi chieu user story va tim truong hop bien ma AI bo sot.
- AI: de xuat skeleton, giai thich loi, de xuat test case; khong duoc coi la nguon quyet dinh cuoi cung.

## Checklist truoc khi push

- [ ] Prompt khong chua password, token, file tai lieu rieng hoac du lieu ca nhan.
- [ ] API khong tin `userId` tu request body; user hien tai duoc lay tu co che dung chung.
- [ ] Loi duoc tra ve theo contract va khong lo stack trace hay thong tin noi bo.
- [ ] Test bao gom truong hop thanh cong, input khong hop le va user khong co quyen.
- [ ] Commit message mo ta mot thay doi co the review doc lap.

## Mau evidence

Luu trong `docs/ai-evidence/` cho moi cong viec quan trong:

- Muc tieu va file trong pham vi.
- Prompt da dung (loai bo du lieu nhay cam).
- De xuat cua AI va phan ket qua duoc chap nhan/tu choi.
- Cac thay doi thu cong sau khi review.
- Lenh test, ket qua va bug da phat hien neu co.
