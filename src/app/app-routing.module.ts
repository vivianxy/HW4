import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { SearchResultComponent } from './search-result/search-result.component';

const routes: Routes = [
  {
  path:'search',component:SearchResultComponent
  },
  {
  path:'watchlist',component:WatchlistComponent
  },
  {
    path:'portfolio',component:PortfolioComponent
  },
  {
    path:'',redirectTo:'/search',pathMatch:'full'
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
