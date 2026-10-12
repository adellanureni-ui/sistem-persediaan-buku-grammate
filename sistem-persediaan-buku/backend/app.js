(() => {
  window.supabase = window.supabase || {};

  window.supabase.config = {
    url: 'https://zmbcwdyjbbmbwyaxvnzd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYmN3ZHlqYmJtYnd5YXh2bnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NzI2ODYsImV4cCI6MjEwNjE0ODY4Nn0.LKQgRi7TkaI0213MzaaaJ43kClhPiclvqgfasRz8c2c'
  };

  window.supabase.getClient = function () {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      console.error('Supabase JS SDK belum terpasang. Pastikan script CDN @supabase/supabase-js sudah dimuat sebelum backend/app.js.');
      return null;
    }

    const { url, anonKey } = this.config || {};
    if (!url || !anonKey || url.includes('your-project-id') || anonKey.includes('your-anon-key')) {
      console.error('Supabase URL atau anonKey belum terisi dengan benar.');
      return null;
    }

    return window.supabase.createClient(url, anonKey);
  };

  console.info('Supabase config loaded. Pastikan RLS sudah diatur untuk CRUD anon di Supabase.');
})();
