"use client";

import { useEffect } from 'react';

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function EnsureGuestId() {
  useEffect(() => {
    try {
      const lsId = localStorage.getItem('guest_id');
      const cookieId = getCookie('guest_id');
      // 保存：Cookieが存在すれば localStorage にバックアップ
      if (cookieId && cookieId !== lsId) {
        localStorage.setItem('guest_id', cookieId);
        return;
      }
      // 復元：Cookieが無く、localStorage にある場合はAPIで再発行してからリロード
      if (!cookieId && lsId) {
        fetch(`/api/guest?id=${encodeURIComponent(lsId)}`, { cache: 'no-store' })
          .then(() => location.reload())
          .catch(() => {/* noop */});
      }
    } catch {
      // noop
    }
  }, []);
  return null;
}

