import {createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { createCustomElement } from '@angular/elements'
import { MemberManager } from './app/features/member-manager/member-manager';


const tag ='member-manager';
async function defineElement() {
  if(customElements.get(tag)) return;
  const app = await createApplication(appConfig);
  const el = createCustomElement(MemberManager, {injector:app.injector});
  customElements.define(tag,el);
}
void defineElement();
