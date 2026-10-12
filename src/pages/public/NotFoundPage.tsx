import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '80px auto',
        padding: '32px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 800,
          color: 'var(--accent)',
          lineHeight: 1,
          marginBottom: '16px',
        }}
      >
        404
      </div>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          margin: '0 0 12px',
          color: 'var(--text-h)',
        }}
      >
        Không tìm thấy trang
      </h2>
      <p
        style={{
          color: 'var(--text)',
          fontSize: '15px',
          lineHeight: 1.6,
          marginBottom: '28px',
        }}
      >
        Đường dẫn bạn truy cập không tồn tại hoặc đã được chuyển sang địa chỉ
        khác.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          to="/"
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            background: 'var(--accent)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Trở về Trang chủ
        </Link>
        <Link
          to="/auth/login"
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Đăng nhập quản trị
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
