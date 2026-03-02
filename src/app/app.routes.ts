import { Routes } from '@angular/router';
import { HomePageComponent } from './features/public/home/home-page.component';
import { PostDetailPageComponent } from './features/public/post-detail/post-detail-page.component';
import { CategoryPostsPageComponent } from './features/public/category-posts/category-posts-page.component';
import { AdminLoginPageComponent } from './features/admin/login/admin-login-page.component';
import { AdminDashboardPageComponent } from './features/admin/dashboard/admin-dashboard-page.component';
import { AdminPostsPageComponent } from './features/admin/posts/admin-posts-page.component';
import { AdminPostCreatePageComponent } from './features/admin/posts/admin-post-create-page.component';
import { AdminCategoriesPageComponent } from './features/admin/categories/admin-categories-page.component';
import { AdminCommentsPageComponent } from './features/admin/comments/admin-comments-page.component';
import { AdminSponsorsPageComponent } from './features/admin/sponsors/admin-sponsors-page.component';
import { AdminAuditLogsPageComponent } from './features/admin/audit-logs/admin-audit-logs-page.component';
import { adminSurfaceGuard, publicSurfaceGuard } from './core/guards/host-surface.guard';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const routes: Routes = [
	{
		path: '',
		component: HomePageComponent,
		canMatch: [publicSurfaceGuard],
	},
	{
		path: 'noticias/:slug',
		component: PostDetailPageComponent,
		canMatch: [publicSurfaceGuard],
	},
	{
		path: 'categorias/:slug',
		component: CategoryPostsPageComponent,
		canMatch: [publicSurfaceGuard],
	},
	{
		path: 'admin/login',
		component: AdminLoginPageComponent,
		canMatch: [adminSurfaceGuard],
	},
	{
		path: 'admin',
		component: AdminDashboardPageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/posts',
		component: AdminPostsPageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/posts/new',
		component: AdminPostCreatePageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/posts/:id/edit',
		component: AdminPostCreatePageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/categories',
		component: AdminCategoriesPageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/comments',
		component: AdminCommentsPageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/sponsors',
		component: AdminSponsorsPageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: 'admin/audit-logs',
		component: AdminAuditLogsPageComponent,
		canMatch: [adminSurfaceGuard],
		canActivate: [adminAuthGuard],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
