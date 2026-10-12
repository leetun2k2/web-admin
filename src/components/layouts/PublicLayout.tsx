import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './PublicLayout.module.css';

const CURRENT_YEAR = new Date().getFullYear();

export interface PublicLayoutProps {
  children?: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className={styles.publicContainer}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandLogo}>A</div>
            <div className={styles.brandInfo}>
              <span className={styles.brandName}>Anthony Lewis</span>
              <span className={styles.brandBadge}>Web Admin</span>
            </div>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              Trang chủ
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={styles.navLink}
            >
              Tài liệu
            </a>
          </nav>

          <div className={styles.authActions}>
            <Link to="/auth/login" className={styles.loginBtn}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children ?? <Outlet />}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            © {CURRENT_YEAR} Anthony Lewis. Nền tảng quản trị hệ thống tập
            trung.
          </div>
          <div className={styles.footerLinks}>
            <Link to="/auth/login">Đăng nhập</Link>
            <a href="#support">Hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
