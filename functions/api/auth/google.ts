export const onRequestPost = async (context: { request: Request }) => {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const googleEmail = (body.email || 'pengguna.google@gmail.com').trim().toLowerCase();
    const googleName = body.name || 'Pengguna Google';
    const initialAvatar = googleName.charAt(0).toUpperCase() || 'G';
    const token = 'tok_g_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: 'u_g_' + Date.now(),
          name: googleName,
          email: googleEmail,
          avatar: initialAvatar,
        },
        token,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err?.message || 'Gagal memproses autentikasi Google',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
