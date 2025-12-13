function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
      <span className="material-symbols-outlined text-text-main dark:text-white transition-colors duration-500">menu</span>
      <span className="font-bold text-lg text-text-main dark:text-white transition-colors duration-500">ServicePro</span>
      <div
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWUqv9wGPxzeP-MKpfwUjj2-3d-4MCgQYcTu_NNyIjLMLLwP7PF2jFA95Tnu9Y-HHBBzqkYn7EE7i2yBfdUIZhO94K4bRHlQAaLuNOMtsP4oX_hYIhJt-9QbbXC6g3ka7Sg3dMH2je3qAm26ld1sPxM_nF8k-z8w-wnnF9Px8UlGmgJ5g445MhmKBm1pNSQ7fXp9PjQgyuLr0dJEuA0pK2VwMT2OsUPGNjnb5DjxJm1by2k2s2bET4lvdxU-oI4yUr-94LAht2U44")',
        }}
      />
    </header>
  )
}

export default MobileHeader

