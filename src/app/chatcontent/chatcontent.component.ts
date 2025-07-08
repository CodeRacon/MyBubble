import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

import { HeaderComponent } from './header/header.component';
import { WorkspacemenuComponent } from './workspacemenu/workspacemenu.component';
import { ChatviewComponent } from './chatview/chatview.component';
import { ThreadviewComponent } from './threadview/threadview.component';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../utils/services/navigation.service';
import { EmojipickerComponent } from './emojipicker/emojipicker.component';

@Component({
  selector: 'app-chatcontent',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    WorkspacemenuComponent,
    ChatviewComponent,
    ThreadviewComponent,
    WorkspacemenuComponent,
    EmojipickerComponent,
  ],
  templateUrl: './chatcontent.component.html',
  styleUrl: './chatcontent.component.scss',
})
export class ChatcontentComponent implements OnInit, OnDestroy {
  private breakpointSubscription: Subscription | undefined;

  // NOTE 
  // these boolean flags control the visibility of the three main areas
  // they are set by the layout logic and used in the template via *ngIf,
  // separating layout logic and template rendering
  currentLayout:
    | 'three-columns'
    | 'two-broad-columns'
    | 'two-narrow-columns'
    | 'one-broad-column' = 'three-columns';

  isWorkspaceMenuVisible = true;
  isThreadViewVisible = false;
  isChatViewVisible = true;
  isSingleColumn = false;
  isThreadViewFullWidth = false;
  navigationService = inject(NavigationService);

  constructor(private breakpointObserver: BreakpointObserver) {}

  // NOTE 
  // BreakpointObserver from Angular CDK monitors the window size
  // 4 defined breakpoints determine the layout:
  // from 3-column desktop to 1-column mobile
  // each time a change is made, setLayout() is called automatically

  /**
   * Initializes the layout of the chat content component based on the current screen size.
   * Subscribes to breakpoint changes and updates the layout accordingly.
   * Also subscribes to navigation service changes to update the visibility of different views.
   */
  ngOnInit() {
    const layoutBreakpoints = {
      'three-columns': '(min-width: 1200px)',
      'two-broad-columns': '(min-width: 892px) and (max-width: 1199px)',
      'two-narrow-columns': '(min-width: 716px) and (max-width: 891px)',
      'one-broad-column': '(min-width: 320px) and (max-width: 715px)',
    };

    this.breakpointSubscription = this.breakpointObserver
      .observe(Object.values(layoutBreakpoints))
      .subscribe((state: BreakpointState) => {
        if (state.breakpoints[layoutBreakpoints['three-columns']]) {
          this.currentLayout = 'three-columns';
        } else if (state.breakpoints[layoutBreakpoints['two-broad-columns']]) {
          this.currentLayout = 'two-broad-columns';
        } else if (state.breakpoints[layoutBreakpoints['two-narrow-columns']]) {
          this.currentLayout = 'two-narrow-columns';
        } else {
          this.currentLayout = 'one-broad-column';
        }
        this.setLayout();
      });

    // NOTE 
    // layout reacts not only to screen size, but also to user actions:
    // if a user opens a thread on the cell phone, workspace-menu and chat are automatically hidden
    // these changes are coordinated by the BehaviorSubject from the NavigationService

    this.navigationService.change$.subscribe((change) => {
      if (change === 'threadViewObjectSet') {
        this.isThreadViewVisible = true;
        if (this.currentLayout === 'one-broad-column') {
          this.isWorkspaceMenuVisible = false;
          this.isChatViewVisible = false;
        }
      } else if (change === 'threadViewObjectCleared') {
        this.isThreadViewVisible = false;
        if (this.currentLayout === 'one-broad-column') {
          this.isChatViewVisible = true;
        }
      } else if (
        change === 'chatViewObjectSetAsChannel' ||
        change === 'chatViewObjectSetAsChat'
      ) {
        this.isChatViewVisible = true;
        if (this.currentLayout === 'one-broad-column') {
          this.isWorkspaceMenuVisible = false;
          this.isThreadViewVisible = false;
        }
      }
      this.setLayout();
    });
  }

  /**
   * Unsubscribes from the breakpoint subscription when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  // NOTE
  // each breakpoint has its own layout logic:
  // - with a 2-column layout, the thread displaces the workspace menu
  // - with a 1-column layout, only one view is displayed at a time
  // kind of priority Management for different screen sizes

  /**
   * Sets the layout of the chat content based on the current layout mode.
   * This method is called when the layout mode changes to adjust the visibility
   * of the various components (workspace menu, chat view, thread view) based on
   * the current layout.
   */
  setLayout() {
    switch (this.currentLayout) {
      case 'three-columns':
        this.adjustThreeColumnLayout();
        break;
      case 'two-broad-columns':
        this.adjustTwoBroadColumnLayout();
        break;
      case 'two-narrow-columns':
        this.adjustTwoNarrowColumnLayout();
        break;
      case 'one-broad-column':
        this.adjustOneBroadColumnLayout();
        break;
    }
  }

  /**
   * Adjusts the layout of the chat content when the current layout is set to 'three-columns'.
   * This method sets the `isSingleColumn` flag based on the visibility of the workspace menu and thread view.
   */
  adjustThreeColumnLayout() {
    this.isSingleColumn =
      !this.isWorkspaceMenuVisible && !this.isThreadViewVisible;
  }

  /**
   * Adjusts the layout of the chat content when the current layout is set to 'two-broad-columns'.
   * This method sets the visibility of the workspace menu and chat view based on the visibility of the thread view.
   */
  adjustTwoBroadColumnLayout() {
    if (this.isThreadViewVisible) {
      this.isWorkspaceMenuVisible = false;
      this.isChatViewVisible = true;
    } else {
      this.isChatViewVisible = true;
    }
  }

  /**
   * Adjusts the layout of the chat content when the current layout is set to 'two-narrow-columns'.
   * This method sets the visibility of the chat view based on the visibility of the thread view.
   */
  adjustTwoNarrowColumnLayout() {
    if (!this.isWorkspaceMenuVisible) {
      this.isChatViewVisible = !this.isThreadViewVisible;
    } else {
      this.isChatViewVisible = !this.isThreadViewVisible;
    }
  }

  /**
   * Adjusts the layout of the chat content when the current layout is set to 'one-broad-column'.
   * This method sets the visibility of the workspace menu, chat view, and thread view based on the visibility of the thread view and workspace menu.
   */
  adjustOneBroadColumnLayout() {
    if (this.isThreadViewVisible) {
      this.isWorkspaceMenuVisible = false;
      this.isChatViewVisible = false;
    } else if (this.isWorkspaceMenuVisible) {
      this.isChatViewVisible = false;
    } else {
      this.isChatViewVisible = true;
    }
  }

  /**
   * Toggles the visibility of the thread view in the chat content component.
   * This method adjusts the visibility of the workspace menu, chat view, and thread view based on the current layout of the chat content.
   */
  toggleThreadView() {
    this.isThreadViewVisible = !this.isThreadViewVisible;

    if (this.currentLayout === 'two-broad-columns') {
      if (this.isThreadViewVisible) {
        this.isWorkspaceMenuVisible = false;
      }
      this.isChatViewVisible = true;
    } else if (this.currentLayout === 'two-narrow-columns') {
      this.isChatViewVisible = !this.isThreadViewVisible;
    } else if (
      this.currentLayout !== 'three-columns' &&
      this.isThreadViewVisible
    ) {
      this.isWorkspaceMenuVisible = false;
    } else if (this.currentLayout === 'one-broad-column') {
      if (this.isThreadViewVisible) {
        this.isWorkspaceMenuVisible = false;
        this.isChatViewVisible = false;
      } else {
        this.isChatViewVisible = true;
      }
    }

    this.setLayout();
  }

  /**
   * Toggles the visibility of the workspace menu in the chat content component.
   * This method adjusts the visibility of the workspace menu, chat view, and thread view based on the current layout of the chat content.
   */
  toggleWorkspaceMenu() {
    this.isWorkspaceMenuVisible = !this.isWorkspaceMenuVisible;

    if (this.currentLayout === 'two-broad-columns') {
      if (this.isWorkspaceMenuVisible) {
        this.isThreadViewVisible = false;
      }
      this.isChatViewVisible = true;
    } else if (this.currentLayout === 'two-narrow-columns') {
      if (this.isWorkspaceMenuVisible) {
        this.isChatViewVisible = true;
        this.isThreadViewVisible = false;
      }
    } else if (
      this.currentLayout !== 'three-columns' &&
      this.isWorkspaceMenuVisible
    ) {
      this.isThreadViewVisible = false;
    } else if (this.currentLayout === 'one-broad-column') {
      if (this.isWorkspaceMenuVisible) {
        this.isChatViewVisible = false;
        this.isThreadViewVisible = false;
      } else {
        this.isChatViewVisible = true;
      }
    }

    this.setLayout();
  }
}
