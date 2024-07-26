import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasComponent } from './canvas/canvas.component';
import { paperAreaGuard } from './guards/paper-area.guard';

const routes: Routes = [
  { path: '', redirectTo: 'block-area/', pathMatch: 'full' },
  { path: 'block-area/:paper_type_version_code', component: CanvasComponent,resolve: {data: paperAreaGuard} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
