import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { PdfService } from '../../../services/pdf.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { ChartTabComponent } from '../../chart-tab/chart-tab.component';
import { ProfileTabComponent } from '../../profile-tab/profile-tab.component';
import { SocialmediaTabComponent } from '../../socialmedia-tab/socialmedia-tab.component';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pdfHost', { read: ViewContainerRef, static: true })
  pdfHost!: ViewContainerRef;

  isGeneratingPdf = false;
  downloadProgress = '';
  mobileMenuOpen = false;

  private createdComponents: ComponentRef<any>[] = [];
  private routerSubscription?: Subscription;
  private resizeTimeout?: any;

  constructor(
    private pdfService: PdfService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  ngAfterViewInit(): void {
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');

    this.createdComponents.forEach((c) => c.destroy());
    this.pdfHost?.clear();
  }

  private setupEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.add('tabs-component-loaded');
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    if (typeof document !== 'undefined') {
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');
      }
    }

    this.cdr.detectChanges();

    if ('vibrate' in navigator && this.mobileMenuOpen) {
      navigator.vibrate(50);
    }
  }

  closeMobileMenu(): void {
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;

      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');
      }

      this.cdr.detectChanges();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const windowWidth = event.target.innerWidth;
      if (windowWidth > 991 && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }

      if (windowWidth <= 991) {
        this.handleMobileOrientationChange();
      }
    }, 150);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.mobileMenuOpen) {
      event.preventDefault();
      this.closeMobileMenu();
    }
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(): void {
    setTimeout(() => {
      this.handleMobileOrientationChange();
    }, 300);
  }

  private handleMobileOrientationChange(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    if (this.mobileMenuOpen && sidebar && menuToggle) {
      if (!sidebar.contains(target) && !menuToggle.contains(target)) {
        this.closeMobileMenu();
      }
    }
  }

  async downloadPDF(): Promise<void> {
    try {
      this.isGeneratingPdf = true;
      this.downloadProgress = 'Initializing PDF generation...';
      this.cdr.detectChanges();

      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }

      this.pdfHost.clear();
      this.createdComponents = [];

      this.downloadProgress = 'Creating chart component...';
      this.cdr.detectChanges();
      await this.delay(200);

      try {
        this.createdComponents.push(
          this.pdfHost.createComponent(ChartTabComponent)
        );
      } catch (error) {
        console.warn('Failed to create ChartTabComponent:', error);
      }

      this.downloadProgress = 'Creating profile component...';
      this.cdr.detectChanges();
      await this.delay(200);

      try {
        this.createdComponents.push(
          this.pdfHost.createComponent(ProfileTabComponent)
        );
      } catch (error) {
        console.warn('Failed to create ProfileTabComponent:', error);
      }

      this.downloadProgress = 'Creating social media component...';
      this.cdr.detectChanges();
      await this.delay(200);

      try {
        this.createdComponents.push(
          this.pdfHost.createComponent(SocialmediaTabComponent)
        );
      } catch (error) {
        console.warn('Failed to create SocialmediaTabComponent:', error);
      }

      this.downloadProgress = 'Rendering components...';
      this.cdr.detectChanges();
      await this.delay(1000);

      this.downloadProgress = 'Generating PDF document...';
      this.cdr.detectChanges();
      await this.delay(300);

      await this.pdfService.generateComprehensivePDF();

      this.downloadProgress = 'PDF generated successfully!';
      this.cdr.detectChanges();

      this.showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.downloadProgress = 'Error generating PDF. Please try again.';
      this.showNotification(
        'Failed to generate PDF. Please try again.',
        'error'
      );
    } finally {
      this.createdComponents.forEach((c) => {
        try {
          c.destroy();
        } catch (error) {
          console.warn('Error destroying component:', error);
        }
      });
      this.pdfHost.clear();

      setTimeout(() => {
        this.isGeneratingPdf = false;
        this.downloadProgress = '';
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {
    if (typeof document === 'undefined') return;

    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
      word-wrap: break-word;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      background: ${
        type === 'success'
          ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
          : 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)'
      };
    `;

    const mediaQuery = window.matchMedia('(max-width: 575px)');
    if (mediaQuery.matches) {
      notification.style.right = '10px';
      notification.style.left = '10px';
      notification.style.maxWidth = 'calc(100vw - 20px)';
      notification.style.fontSize = '13px';
      notification.style.top = '70px';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3500);

    notification.addEventListener('click', () => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }
}
