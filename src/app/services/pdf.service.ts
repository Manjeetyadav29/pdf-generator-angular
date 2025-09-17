import { Injectable } from '@angular/core';
import { ChartService, PopulationEntry } from '../tabs/chart-tab/chart.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import html2canvas from 'html2canvas';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

export interface ComponentContent {
  title: string;
  content: any[];
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private chartService: ChartService) {}

  async generateComprehensivePDF(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('PDF generation must run in the browser.');
    }

    try {
      const [chartText, profileText, socialText] = await Promise.all([
        this.getChartContent(),
        this.getProfileContent(),
        this.getSocialMediaContent(),
      ]);

      const images: { title: string; dataUrl: string }[] = [];

      const chartCanvas = document.getElementById(
        'chartCanvas'
      ) as HTMLCanvasElement | null;
      if (chartCanvas && (chartCanvas as any).toDataURL) {
        const dataUrl = chartCanvas.toDataURL('image/png', 1.0);
        images.push({ title: 'Chart (UI snapshot)', dataUrl });
      } else {
        const chartWrapper =
          document.getElementById('chart-section') ||
          document.getElementById('chart-canvas-wrapper');
        if (chartWrapper) {
          const canvas = await html2canvas(chartWrapper, {
            scale: 2,
            useCORS: true,
          });
          images.push({
            title: 'Chart (UI snapshot)',
            dataUrl: canvas.toDataURL('image/jpeg', 0.9),
          });
        }
      }

      const profileEl = document.getElementById('profile-section');
      if (profileEl) {
        const canvas = await html2canvas(profileEl, {
          scale: 2,
          useCORS: true,
        });
        images.push({
          title: 'Profile (UI snapshot)',
          dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        });
      }

      const socialEl = document.getElementById('social-section');
      if (socialEl) {
        const canvas = await html2canvas(socialEl, { scale: 2, useCORS: true });
        images.push({
          title: 'Social (UI snapshot)',
          dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        });
      }

      const content: any[] = [
        {
          text: 'COMPREHENSIVE REPORT',
          style: 'mainHeader',
          alignment: 'center',
          margin: [0, 0, 0, 12],
        },
        {
          text: `Generated on: ${new Date().toLocaleString()}`,
          style: 'dateHeader',
          alignment: 'center',
          margin: [0, 0, 0, 18],
        },
        {
          text: 'Executive Summary',
          style: 'sectionHeader',
          margin: [0, 10, 0, 6],
        },
        {
          text:
            'This report consolidates data from multiple sections of the application, including charts, ' +
            'user profiles, and social media insights. Each section is presented with both a visual ' +
            'snapshot of the UI and structured textual analysis to ensure readability and long-term record keeping.',
          style: 'normalText',
          margin: [0, 0, 0, 14],
        },
      ];

      for (const img of images) {
        content.push({
          text: img.title,
          style: 'sectionHeader',
          margin: [0, 8, 0, 6],
        });

        content.push({
          image: img.dataUrl,
          width: 500,
          margin: [0, 0, 0, 10],
        });

        if (img.title.toLowerCase().includes('chart')) {
          content.push(...chartText.content);
        } else if (img.title.toLowerCase().includes('profile')) {
          content.push(...profileText.content);
        } else if (img.title.toLowerCase().includes('social')) {
          content.push(...socialText.content);
        }

        content.push({ text: '', pageBreak: 'after' });
      }

      content.push({
        text: 'Conclusion & Recommendations',
        style: 'sectionHeader',
        margin: [0, 10, 0, 6],
      });

      content.push({
        text:
          'The combined data from charts, profiles, and social media presence presents a holistic view ' +
          'of user engagement and outreach. It is recommended to build on the strengths of platforms ' +
          'with higher activity and to maintain consistency across profile and chart-driven insights. ' +
          'This document serves as a baseline for future performance tracking.',
        style: 'normalText',
        margin: [0, 0, 0, 14],
      });

      content.push({
        text: 'End of Report',
        style: 'footer',
        alignment: 'center',
        margin: [0, 10, 0, 0],
      });

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content,
        styles: {
          mainHeader: { fontSize: 22, bold: true, color: '#2c3e50' },
          dateHeader: { fontSize: 10, italics: true, color: '#7f8c8d' },
          sectionHeader: {
            fontSize: 16,
            bold: true,
            color: '#34495e',
            margin: [0, 6, 0, 6],
          },
          subHeader: { fontSize: 12, bold: true, margin: [0, 6, 0, 6] },
          normalText: { fontSize: 11, lineHeight: 1.3 },
          tableHeader: {
            fontSize: 11,
            bold: true,
            color: 'white',
            fillColor: '#3498db',
          },
          footer: { fontSize: 9, italics: true, color: '#95a5a6' },
          linkText: {
            fontSize: 11,
            color: '#3498db',
            decoration: 'underline',
          },
        },
        defaultStyle: {
          fontSize: 11,
        },
      };

      pdfMake.createPdf(docDefinition).download('comprehensive-report.pdf');
    } catch (err) {
      console.error('PDF generation error', err);
      throw err;
    }
  }

  private async getChartContent(): Promise<ComponentContent> {
    return new Promise((resolve) => {
      this.chartService.getPopulationData().subscribe({
        next: (data: PopulationEntry[]) => {
          const total = data.reduce((sum, entry) => sum + entry.population, 0);
          const content = [
            { text: 'AUSTRALIAN POPULATION ANALYSIS', style: 'sectionHeader' },
            {
              text: 'Population Distribution by State/Territory',
              style: 'subHeader',
            },
            {
              text: `Total population analyzed: ${total.toLocaleString()}.`,
              style: 'normalText',
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto'],
                body: [
                  [
                    { text: 'State/Territory', style: 'tableHeader' },
                    { text: 'Population', style: 'tableHeader' },
                    { text: 'Percentage', style: 'tableHeader' },
                  ],
                  ...data.map((entry) => [
                    { text: entry.state, style: 'normalText' },
                    {
                      text: entry.population.toLocaleString(),
                      style: 'normalText',
                      alignment: 'right',
                    },
                    {
                      text: `${((entry.population / total) * 100).toFixed(1)}%`,
                      style: 'normalText',
                      alignment: 'right',
                    },
                  ]),
                ],
              },
              layout: {
                fillColor: function (rowIndex: number) {
                  return rowIndex % 2 === 0 ? '#f8f9fa' : null;
                },
              },
              margin: [0, 0, 0, 12],
            },
            {
              text:
                'This distribution highlights the proportional population sizes across regions. ' +
                'The table provides exact figures, while the visual chart snapshot complements it with an at-a-glance perspective.',
              style: 'normalText',
              margin: [0, 0, 0, 12],
            },
          ];
          resolve({ title: 'Chart Data', content });
        },
        error: (err) => {
          console.error('Error fetching chart data:', err);
          resolve({
            title: 'Chart Data',
            content: [
              { text: 'Error: Unable to load chart data', style: 'normalText' },
            ],
          });
        },
      });
    });
  }

  private async getProfileContent(): Promise<ComponentContent> {
    const profileData = {
      name: 'Samantha Jones',
      location: 'New York, United States',
      role: 'Web Producer - Web Specialist',
      education: 'Columbia University - New York',
      stats: { friends: 65, photos: 43, comments: 21 },
      isOnline: true,
      mutualFriends: 12,
      joinDate: 'Member since 2020',
    };

    const content = [
      { text: 'USER PROFILE INFORMATION', style: 'sectionHeader' },
      { text: 'Personal Details', style: 'subHeader' },
      {
        table: {
          widths: ['30%', '*'],
          body: [
            [
              { text: 'Full Name:', style: 'normalText', bold: true },
              { text: profileData.name, style: 'normalText' },
            ],
            [
              { text: 'Location:', style: 'normalText', bold: true },
              { text: profileData.location, style: 'normalText' },
            ],
            [
              { text: 'Role:', style: 'normalText', bold: true },
              { text: profileData.role, style: 'normalText' },
            ],
            [
              { text: 'Education:', style: 'normalText', bold: true },
              { text: profileData.education, style: 'normalText' },
            ],
            [
              { text: 'Member Since:', style: 'normalText', bold: true },
              { text: profileData.joinDate, style: 'normalText' },
            ],
            [
              { text: 'Status:', style: 'normalText', bold: true },
              {
                text: profileData.isOnline ? 'Online' : 'Offline',
                style: 'normalText',
                color: profileData.isOnline ? '#27ae60' : '#e74c3c',
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 12],
      },
      {
        text: 'Social Statistics',
        style: 'subHeader',
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Friends', style: 'tableHeader', alignment: 'center' },
              { text: 'Photos', style: 'tableHeader', alignment: 'center' },
              { text: 'Comments', style: 'tableHeader', alignment: 'center' },
            ],
            [
              {
                text: profileData.stats.friends.toString(),
                style: 'normalText',
                alignment: 'center',
                bold: true,
              },
              {
                text: profileData.stats.photos.toString(),
                style: 'normalText',
                alignment: 'center',
                bold: true,
              },
              {
                text: profileData.stats.comments.toString(),
                style: 'normalText',
                alignment: 'center',
                bold: true,
              },
            ],
          ],
        },
        margin: [0, 0, 0, 12],
      },
      {
        text:
          `${profileData.name} is currently based in ${profileData.location}. ` +
          `Working as a ${profileData.role}, they have pursued studies at ${profileData.education}. ` +
          `They have been an active member of the platform since ${profileData.joinDate}, ` +
          `maintaining ${profileData.stats.friends} friends, ${profileData.stats.photos} photos, ` +
          `and ${profileData.stats.comments} comments. Their profile reflects consistent engagement ` +
          `and contribution to the community.`,
        style: 'normalText',
        margin: [0, 0, 0, 12],
      },
    ];

    return { title: 'Profile Data', content };
  }

  private async getSocialMediaContent(): Promise<ComponentContent> {
    const socialPlatforms = [
      {
        name: 'TWITTER',
        description: 'Social networking ...',
        followers: 25400,
        posts: 1200,
        isConnected: false,
        url: 'https://twitter.com',
      },
      {
        name: 'INSTAGRAM',
        description: 'Photo & video sharing ...',
        followers: 18900,
        posts: 847,
        isConnected: true,
        url: 'https://instagram.com',
      },
      {
        name: 'YOUTUBE',
        description: 'Video sharing ...',
        followers: 45200,
        posts: 324,
        isConnected: false,
        url: 'https://youtube.com',
      },
    ];

    const content = [
      { text: 'SOCIAL MEDIA PRESENCE', style: 'sectionHeader' },
      { text: 'Platform Overview', style: 'subHeader' },
      {
        text: 'This section provides a comprehensive overview of social platforms.',
        style: 'normalText',
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          headerRows: 1,
          widths: ['20%', '*', '15%', '12%', '12%', '15%'],
          body: [
            [
              { text: 'Platform', style: 'tableHeader' },
              { text: 'Description', style: 'tableHeader' },
              { text: 'Status', style: 'tableHeader' },
              { text: 'Followers', style: 'tableHeader' },
              { text: 'Posts', style: 'tableHeader' },
              { text: 'Platform URL', style: 'tableHeader' },
            ],
            ...socialPlatforms.map((p) => [
              { text: p.name, style: 'normalText', bold: true },
              { text: p.description, style: 'normalText' },
              {
                text: p.isConnected ? 'Connected' : 'Not Connected',
                style: 'normalText',
                color: p.isConnected ? '#27ae60' : '#e74c3c',
              },
              {
                text: p.followers?.toLocaleString() || 'N/A',
                style: 'normalText',
                alignment: 'right',
              },
              {
                text: p.posts?.toLocaleString() || 'N/A',
                style: 'normalText',
                alignment: 'right',
              },
              { text: p.url, style: 'linkText', link: p.url },
            ]),
          ],
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex % 2 === 0 ? '#f8f9fa' : null;
          },
        },
        margin: [0, 0, 0, 12],
      },
      {
        text:
          'Insights: The above data shows varying engagement across platforms. ' +
          'For instance, YouTube has the highest follower base, while Instagram demonstrates ' +
          'a stronger active connection status. Twitter remains important for reach but is currently ' +
          'not connected. These insights can help prioritize future social campaigns.',
        style: 'normalText',
        margin: [0, 0, 0, 12],
      },
    ];

    return { title: 'Social Media Data', content };
  }
}
