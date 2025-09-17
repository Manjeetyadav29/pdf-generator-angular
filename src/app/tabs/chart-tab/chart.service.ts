import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PopulationEntry {
  state: string;
  population: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private DATA_URL = 'assets/data.json';

  constructor(private http: HttpClient) {}

  getPopulationData(): Observable<PopulationEntry[]> {
    return this.http.get<PopulationEntry[]>(this.DATA_URL);
  }
}
