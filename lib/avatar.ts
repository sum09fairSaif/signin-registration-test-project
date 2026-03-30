export function createAvatarDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="User avatar">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#19d2b1" />
          <stop offset="100%" stop-color="#3468f0" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="106" fill="url(#avatarGradient)" />
      <circle cx="120" cy="86" r="26" fill="#ffffff" />
      <path
        d="M74 176c0-24.301 19.699-44 44-44h4c24.301 0 44 19.699 44 44v10H74z"
        fill="#ffffff"
      />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
