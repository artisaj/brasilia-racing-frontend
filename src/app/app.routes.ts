import { Routes } from '@angular/router';
import { HomePageComponent } from './features/public/home/home-page.component';
import { AdminLoginPageComponent } from './features/admin/login/admin-login-page.component';
import { AdminDashboardPageComponent } from './features/admin/dashboard/admin-dashboard-page.component';
import { AdminPostsPageComponent } from './features/admin/posts/admin-posts-page.component';
import { AdminCategoriesPageComponent } from './features/admin/categories/admin-categories-page.component';

export const routes: Routes = [
	{
		path: '',
		component: HomePageComponent,
	},
	{
		path: 'admin/login',
		component: AdminLoginPageComponent,
	},
	{
		path: 'admin',
		component: AdminDashboardPageComponent,
	},
	{
		path: 'admin/posts',
		component: AdminPostsPageComponent,
	},
	{
		path: 'admin/categories',
		component: AdminCategoriesPageComponent,
	},
	{
		path: '**',
		redirectTo: '',
	},
];
