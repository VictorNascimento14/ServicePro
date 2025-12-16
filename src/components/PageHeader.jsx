function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="hidden md:flex items-center justify-between px-8 py-5 bg-background-light dark:bg-background-dark/50 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold tracking-tight text-text-main dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </header>
  )
}

export default PageHeader



