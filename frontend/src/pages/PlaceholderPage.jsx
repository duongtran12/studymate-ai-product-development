export default function PlaceholderPage({ title, description }) {
  return <section className="page-section" aria-labelledby="page-title"><p className="eyebrow">StudyMate prototype</p><h1 id="page-title">{title}</h1><p className="page-intro">{description}</p><div className="empty-state">Noi dung chi tiet cua man hinh nay se duoc bo sung o commit chuc nang tuong ung.</div></section>;
}
