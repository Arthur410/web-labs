import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-news-dialog',
  templateUrl: './news-dialog.component.html',
  standalone: true,
  styleUrls: ['./news-dialog.component.scss'],
  imports: [MatDialogModule, MatButtonModule, RouterLink],
})

export class NewsDialogComponent {
  constructor(public dialogRef: MatDialogRef<NewsDialogComponent>) {}
}
