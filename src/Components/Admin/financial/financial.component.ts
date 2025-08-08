import { Component } from '@angular/core';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.css',
})
export class FinancialComponent {
  touchStartY: number = 0;

  ngOnInit(): void {
    // Simulate loading overlay
    setTimeout(() => {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.classList.add('hidden');
      this.initializeDashboard();
    }, 1000);

    // Keyboard interaction
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        location.reload();
      }
      if (e.key.toLowerCase() === 'u') {
        this.updateAllData();
      }
    });

    // Touch support
    document.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = this.touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.updateAllData();
        } else {
          location.reload();
        }
      }
    });

    // Auto-refresh every 30 seconds
    setInterval(() => {
      this.updateAllData();
    }, 30000);
  }

  initializeDashboard(): void {
    setTimeout(() => {
      (document.getElementById('moneyProgress') as HTMLElement).style.width =
        '80%';
    }, 500);

    setTimeout(() => {
      (document.getElementById('projectsProgress') as HTMLElement).style.width =
        '59%';
    }, 800);

    setTimeout(() => {
      (document.getElementById('teamProgress') as HTMLElement).style.width =
        '75%';
    }, 1100);

    this.animateNumber('moneyValue', 0, 18340, 2000, '$');
    this.animateNumber('projectsValue', 0, 23, 2000);
    this.animateNumber('teamValue', 0, 12, 2000);

    setTimeout(() => {
      this.animateNumber('totalTickets', 0, 2403, 1500);
      this.animateNumber('pendingTickets', 0, 340, 1500);
      this.animateNumber('closedTickets', 0, 1540, 1500);
      this.animateNumber('deletedTickets', 0, 103, 1500);
    }, 500);
  }

  animateNumber(
    elementId: string,
    start: number,
    end: number,
    duration: number,
    prefix: string = ''
  ): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOutCubic);
      element.textContent = prefix + current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  updateTarget(element: HTMLElement, type: string): void {
    element.style.transform = 'scale(0.98)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';

      const progressBar = element.querySelector(
        '.progress-fill'
      ) as HTMLElement;
      const percentage = element.querySelector(
        '.progress-percentage'
      ) as HTMLElement;
      const currentWidth = parseInt(progressBar.style.width);
      const newWidth = Math.min(currentWidth + Math.random() * 10, 100);
      progressBar.style.width = `${newWidth}%`;
      percentage.textContent = `${Math.floor(newWidth)}%`;

      if (type === 'money') {
        const valueEl = document.getElementById('moneyValue');
        const current = parseInt(
          valueEl?.textContent?.replace(/,/g, '') || '0'
        );
        const newValue = current + Math.floor(Math.random() * 1000);
        this.animateNumber('moneyValue', current, newValue, 1000, '$');
      } else if (type === 'projects') {
        const valueEl = document.getElementById('projectsValue');
        const current = parseInt(valueEl?.textContent || '0');
        const newValue = current + Math.floor(Math.random() * 3);
        this.animateNumber('projectsValue', current, newValue, 1000);
      } else if (type === 'team') {
        const valueEl = document.getElementById('teamValue');
        const current = parseInt(valueEl?.textContent || '0');
        const newValue = current + Math.floor(Math.random() * 2);
        this.animateNumber('teamValue', current, newValue, 1000);
      }
    }, 100);
  }

  animateCard(element: HTMLElement, type: string): void {
    element.style.transform = 'scale(0.95) rotateY(5deg)';
    setTimeout(() => {
      element.style.transform = 'scale(1) rotateY(0deg)';
      const numberElement = element.querySelector(
        '.stat-number'
      ) as HTMLElement;
      const current = parseInt(
        numberElement?.textContent?.replace(/,/g, '') || '0'
      );
      let change = 0;

      if (type === 'pending') {
        change = Math.floor(Math.random() * 10) - 5;
      } else if (type === 'closed') {
        change = Math.floor(Math.random() * 20);
      } else if (type === 'deleted') {
        change = Math.floor(Math.random() * 5);
      } else {
        change = Math.floor(Math.random() * 15);
      }

      const newValue = Math.max(0, current + change);
      this.animateNumber(numberElement.id, current, newValue, 800);

      if (type !== 'total') {
        setTimeout(() => this.updateTotal(), 800);
      }
    }, 150);
  }

  updateTotal(): void {
    const pending = parseInt(
      document
        .getElementById('pendingTickets')
        ?.textContent?.replace(/,/g, '') || '0'
    );
    const closed = parseInt(
      document
        .getElementById('closedTickets')
        ?.textContent?.replace(/,/g, '') || '0'
    );
    const deleted = parseInt(
      document
        .getElementById('deletedTickets')
        ?.textContent?.replace(/,/g, '') || '0'
    );
    const current = parseInt(
      document.getElementById('totalTickets')?.textContent?.replace(/,/g, '') ||
        '0'
    );
    const newTotal = pending + closed + deleted;

    if (newTotal !== current) {
      this.animateNumber('totalTickets', current, newTotal, 600);
    }
  }

  updateAllData(): void {
    const types = ['money', 'projects', 'team'];
    const targetCards = document.querySelectorAll('.target-card');

    targetCards.forEach((item, index) => {
      setTimeout(() => {
        this.updateTarget(item as HTMLElement, types[index]);
      }, index * 200);
    });

    setTimeout(() => {
      const statCards = document.querySelectorAll('.stat-card');
      const statTypes = ['total', 'pending', 'closed', 'deleted'];

      statCards.forEach((card, index) => {
        setTimeout(() => {
          this.animateCard(card as HTMLElement, statTypes[index]);
        }, index * 150);
      });
    }, 600);
  }
}
