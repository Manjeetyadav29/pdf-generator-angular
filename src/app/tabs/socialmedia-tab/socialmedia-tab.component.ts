import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SocialMediaPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  url?: string;
  followers?: number;
  posts?: number;
  isConnected: boolean;
}

@Component({
  selector: 'app-socialmedia-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './socialmedia-tab.component.html',
  styleUrls: ['./socialmedia-tab.component.scss'],
})
export class SocialmediaTabComponent {
  socialMediaPlatforms: SocialMediaPlatform[] = [
    {
      id: 'twitter',
      name: 'TWITTER',
      icon: 'assets/images/twitter-logo.jpg',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita ullam aliquid non eligendi, nemo est neque reiciendis error?',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      url: 'https://twitter.com',
      followers: 25400,
      posts: 1200,
      isConnected: false,
    },
    {
      id: 'instagram',
      name: 'INSTAGRAM',
      icon: 'assets/images/instagram-logo.jpg',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita ullam aliquid non eligendi, nemo est neque reiciendis error?',
      backgroundColor: '#e91e63',
      textColor: '#ffffff',
      buttonColor: '#ffffff',
      buttonTextColor: '#e91e63',
      url: 'https://instagram.com',
      followers: 18900,
      posts: 847,
      isConnected: true,
    },
    {
      id: 'youtube',
      name: 'YOUTUBE',
      icon: 'assets/images/youtube-logo.jpg',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita ullam aliquid non eligendi, nemo est neque reiciendis error?',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      url: 'https://youtube.com',
      followers: 45200,
      posts: 324,
      isConnected: false,
    },
  ];
  onReadMore(platform: SocialMediaPlatform): void {
    if (platform.isConnected) {
      this.showPlatformDetails(platform);
    } else {
      this.connectToPlatform(platform);
    }
  }
  connectToPlatform(platform: SocialMediaPlatform): void {
    platform.isConnected = true;
    setTimeout(() => {
      console.log(`Connected to ${platform.name}`);
      this.showSuccessMessage(`Successfully connected to ${platform.name}!`);
    }, 50);
  }

  disconnectFromPlatform(platform: SocialMediaPlatform): void {
    platform.isConnected = false;
    console.log(`Disconnected from ${platform.name}`);
    this.showSuccessMessage(`Disconnected from ${platform.name}`);
  }
  showPlatformDetails(platform: SocialMediaPlatform): void {
    const details = `
      Platform: ${platform.name}
      Followers: ${platform.followers?.toLocaleString() || 'N/A'}
      Posts: ${platform.posts?.toLocaleString() || 'N/A'}
      Status: ${platform.isConnected ? 'Connected' : 'Not Connected'}
    `;

    alert(`${platform.name} Details:\n${details}`);
  }

  sharePlatform(platform: SocialMediaPlatform, event: Event): void {
    event.stopPropagation();

    if (navigator.share) {
      navigator
        .share({
          title: `Check out ${platform.name}`,
          text: platform.description,
          url: platform.url,
        })
        .catch(console.error);
    } else {
      this.copyToClipboard(platform.url || '');
      this.showSuccessMessage(`${platform.name} link copied to clipboard!`);
    }
  }
  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(console.error);
  }
  private showSuccessMessage(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  getButtonText(platform: SocialMediaPlatform): string {
    return platform.isConnected ? 'VIEW PROFILE' : 'READ MORE';
  }
  trackByPlatform(index: number, platform: SocialMediaPlatform): string {
    return platform.id;
  }
}
