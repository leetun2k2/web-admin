import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '64px 24px',
        width: '100%',
      }}
    >
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <span>🚀 Hệ thống Quản trị Web Admin 2026</span>
        </div>

        <h1
          style={{
            fontSize: '44px',
            lineHeight: 1.2,
            letterSpacing: '-1px',
            margin: '0 0 20px',
            color: 'var(--text-h)',
          }}
        >
          Quản lý toàn diện hệ thống cùng{' '}
          <span style={{ color: 'var(--accent)' }}>Anthony Lewis</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text)',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Trang quản trị tập trung mạnh mẽ, bảo mật cao và tối ưu tốc độ tải
          trang với Vite &amp; React Router. Phục vụ quản lý dữ liệu, phân quyền
          và giám sát.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/auth/login"
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: '0 4px 14px rgba(170, 59, 255, 0.3)',
            }}
          >
            Đăng nhập quản trị
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        <div
          style={{
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            ⚡
          </div>
          <h3
            style={{
              fontSize: '18px',
              margin: '0 0 10px',
              color: 'var(--text-h)',
            }}
          >
            Hiệu Năng Vượt Trội
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text)',
            }}
          >
            Được đóng gói với Vite mới nhất kết hợp React Router hiện đại, tốc
            độ chuyển trang tức thì và mượt mà.
          </p>
        </div>

        <div
          style={{
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            🛡️
          </div>
          <h3
            style={{
              fontSize: '18px',
              margin: '0 0 10px',
              color: 'var(--text-h)',
            }}
          >
            Bảo Mật Cao Cấp
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text)',
            }}
          >
            Hệ thống phân chia Auth Layout và Public Layout độc lập, sẵn sàng
            tích hợp JWT Authentication và phân quyền.
          </p>
        </div>

        <div
          style={{
            padding: '28px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            🎨
          </div>
          <h3
            style={{
              fontSize: '18px',
              margin: '0 0 10px',
              color: 'var(--text-h)',
            }}
          >
            Giao Diện Tinh Tế
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text)',
            }}
          >
            Hỗ trợ Light/Dark mode tự nhiên, thiết kế responsive trên mọi kích
            thước màn hình thiết bị.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
