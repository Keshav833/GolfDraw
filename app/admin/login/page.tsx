import AdminLoginForm from '../../../components/admin/AdminLoginForm';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main
      className="h-screen w-full flex items-center justify-center font-sans p-4 overflow-hidden relative"
      style={{
        background:
          'linear-gradient(145deg, #0a1f10 0%, #0f2d18 40%, #091a0f 100%)',
      }}
    >
      {/* Decorative background orbs */}
      <div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(26,94,56,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(125,224,170,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(15,61,36,0.2) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 w-full flex items-center justify-center">
        <AdminLoginForm accessDenied={searchParams.error === 'access_denied'} />
      </div>
    </main>
  );
}
