import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const CURRENT_YEAR = new Date().getFullYear();

export interface AuthLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className={styles.authContainer}>
      <aside className={styles.brandSection}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>A</div>
          <div>
            <h1 className={styles.brandName}>Anthony Lewis</h1>
            <p className={styles.brandTagline}>Web Administration Portal</p>
          </div>
        </div>

        <div className={styles.brandBody}>
          <h2 className={styles.brandHeadline}>
            Quản trị hệ thống dễ dàng và an toàn
          </h2>
          <p className={styles.brandDescription}>
            Nền tảng quản lý tập trung với độ bảo mật cao, giao diện trực quan
            và hiệu năng vượt trội.
          </p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              Bảo mật đa tầng &amp; phân quyền chi tiết
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              Giám sát hệ thống và báo cáo thời gian thực
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              Tối ưu trải nghiệm vận hành quản trị viên
            </li>
          </ul>
        </div>

        <div className={styles.brandFooter}>
          <span>© {CURRENT_YEAR} Anthony Lewis. All rights reserved.</span>
        </div>
      </aside>

      <main className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileBrand}>
            <div className={styles.logoBadge}>A</div>
            <h2 className={styles.brandName}>Anthony Lewis</h2>
            <p className={styles.brandTagline}>Web Administration Portal</p>
          </div>

          <div className={styles.card}>
            {(title || subtitle) && (
              <header className={styles.cardHeader}>
                {title && <h3 className={styles.cardTitle}>{title}</h3>}
                {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
              </header>
            )}
            <div className={styles.cardContent}>{children ?? <Outlet />}</div>
          </div>

          <div className={styles.defaultFooter}>
            Hỗ trợ kỹ thuật? Liên hệ ban quản trị hệ thống.
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
