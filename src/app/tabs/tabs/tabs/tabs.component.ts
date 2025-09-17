import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PdfService } from '../../../services/pdf.service';

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
export class TabsComponent {
  @ViewChild('pdfHost', { read: ViewContainerRef, static: true })
  pdfHost!: ViewContainerRef;

  isGeneratingPdf = false;
  downloadProgress = '';

  private createdComponents: ComponentRef<any>[] = [];

  constructor(private pdfService: PdfService) {}

  async downloadPDF(): Promise<void> {
    try {
      this.isGeneratingPdf = true;
      this.downloadProgress = 'Preparing components for PDF...';

      this.pdfHost.clear();
      this.createdComponents = [];

      this.createdComponents.push(
        this.pdfHost.createComponent(ChartTabComponent)
      );
      this.createdComponents.push(
        this.pdfHost.createComponent(ProfileTabComponent)
      );
      this.createdComponents.push(
        this.pdfHost.createComponent(SocialmediaTabComponent)
      );

      await new Promise((r) => setTimeout(r, 700));

      this.downloadProgress = 'Generating PDF document...';
      await this.pdfService.generateComprehensivePDF();

      this.downloadProgress = 'PDF generated successfully!';
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.downloadProgress = 'Error generating PDF. Please try again.';
    } finally {
      this.createdComponents.forEach((c) => c.destroy());
      this.pdfHost.clear();

      setTimeout(() => {
        this.isGeneratingPdf = false;
        this.downloadProgress = '';
      }, 800);
    }
  }
}
