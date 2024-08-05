import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveTab(event.url);
      }
    });
  }

  setActiveTab(url: any) {
    const tabs = document.querySelectorAll('ion-tab-button');
    tabs.forEach((tab) => {
      const tabAttribute = tab.getAttribute('tab');
      const href = tab.getAttribute('href');
      const img = tab.querySelector('img');

      if (url.includes(href)) {
        if (img) {
          img.src = `assets/img/navbar/${tabAttribute}_active.png`;
        }
        tab.classList.add('active');
      } else {
        if (img) {
          img.src = `assets/img/navbar/${tabAttribute}.png`;
        }
        tab.classList.remove('active');
      }
    });
  }
}
