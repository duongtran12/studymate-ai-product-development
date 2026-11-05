export default function PlaceholderPage({ title, description }) {
  return <section className="page-section" aria-labelledby="page-title"><p className="eyebrow">StudyMate prototype</p><h1 id="page-title">{title}</h1><p className="page-intro">{description}</p><div className="empty-state">Nội dung chi tiết của màn hình này sẽ được bổ sung ở commit chức năng tương ứng.</div></section>;
}
