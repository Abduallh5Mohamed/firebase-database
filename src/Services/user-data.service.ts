import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'technician' | 'driver';
  // Technician specific fields
  specialty?: string;
  certification?: string;
  experience?: string;
  rating?: number;
  completedJobs?: number;
  // Driver specific fields
  licenseNumber?: string;
  vehicleType?: string;
  totalTrips?: number;
  // Common fields
  joinDate?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private currentUserProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUserProfile$ = this.currentUserProfileSubject.asObservable();

  constructor(private firestore: Firestore) {}

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        this.currentUserProfileSubject.next(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getUsersByRole(role: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }

  getCurrentUserProfile(): UserProfile | null {
    return this.currentUserProfileSubject.value;
  }

  setCurrentUserProfile(profile: UserProfile): void {
    this.currentUserProfileSubject.next(profile);
  }

  clearCurrentUserProfile(): void {
    this.currentUserProfileSubject.next(null);
  }
}