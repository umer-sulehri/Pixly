import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <ImageIcon size={32} className={styles.logoIcon} />
          <span className={styles.logoText}>Pixly</span>
        </Link>
        
        <div className={styles.links}>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            <ExternalLink size={20} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
