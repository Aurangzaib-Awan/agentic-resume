export default function ProjectCard({ icon, name, description, tags = [], actions }) {
  return (
    <div className="project-card">
      {icon && <div className="pc-indicator">{icon}</div>}
      <div className="pc-top">
        <span className="pc-name">{name}</span>
      </div>
      <p className="pc-desc">{description}</p>
      {tags.length > 0 && (
        <div className="pc-tags">
          {tags.map((tag) => (
            <span className="pc-tag" key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {actions && <div className="pc-actions">{actions}</div>}
    </div>
  );
}
