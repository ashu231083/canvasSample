import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AppConstant } from '../services/app.constant';

export const paperAreaGuard: ResolveFn<Promise<any>> = (route:ActivatedRouteSnapshot) => {
  const http = inject(HttpService);
  const paper_type_version_code = route.paramMap.get('paper_type_version_code');
  return getVersionData(http, paper_type_version_code);
};

const getVersionData = (
  http: HttpService,
  paper_type_version_code: string | null
) => {
  let requestJSON =
    '{"paper_type_version_code":"' + paper_type_version_code + '"}';
  let fd = new FormData();
  fd.append('action', AppConstant.App_Action.GET_PAPERTYPE_VERSION);
  fd.append('is_block_area', 'true');
  fd.append('requestJSON', requestJSON);
  return new Promise((resolve, resect) => {
    http.httpCall(fd).subscribe((result) => {
      resolve(result)
    });
  });
};
