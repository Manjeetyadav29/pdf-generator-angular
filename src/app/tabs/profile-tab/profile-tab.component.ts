import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tab.component.html',
  styleUrls: ['./profile-tab.component.scss'],
})
export class ProfileTabComponent {
  user = {
    name: 'Samantha Jones',
    location: 'New York, United States',
    role: 'Web Producer - Web Specialist',
    education: 'Columbia University - New York',
    avatar: 'assets/images/avatar.jpg',
    stats: {
      friends: 65,
      photos: 43,
      comments: 21,
    },
    isOnline: true,
    mutualFriends: 12,
    joinDate: 'Member since 2020',
  };

  isConnected = false;
  isFollowing = false;
  showExpandedProfile = false;

  connect() {
    if (this.isConnected) {
      this.isConnected = false;
      alert(`You disconnected from ${this.user.name}`);
    } else {
      this.isConnected = true;
      alert(`You sent a connect request to ${this.user.name}`);
    }
  }

  message() {
    alert(`Opening chat with ${this.user.name}`);
  }

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
    const action = this.isFollowing ? 'following' : 'unfollowed';
    alert(`You ${action} ${this.user.name}`);
  }

  viewPhotos() {
    alert(`Viewing ${this.user.name}'s photos`);
  }

  viewFriends() {
    alert(`Viewing ${this.user.name}'s friends`);
  }

  viewComments() {
    alert(`Viewing ${this.user.name}'s comments`);
  }

  showMore() {
    this.showExpandedProfile = !this.showExpandedProfile;
  }

  shareProfile() {
    alert(`Sharing ${this.user.name}'s profile`);
  }

  reportProfile() {
    alert('Profile reported');
  }
}
