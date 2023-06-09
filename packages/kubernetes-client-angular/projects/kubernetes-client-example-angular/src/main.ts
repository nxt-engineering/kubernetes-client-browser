import { importProvidersFrom } from '@angular/core'
import { AppComponent } from './app/app.component'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { AppRoutingModule } from './app/app-routing.module'
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser'
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import {
  DefaultEntityMetadataMap,
  KubernetesAuthorizerInterceptor,
  KubernetesDataServiceFactory,
  KubernetesDataServiceFactoryConfig,
} from 'kubernetes-client-angular'
import { DefaultDataServiceFactory, EntityDataModule } from '@ngrx/data'

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      StoreModule.forRoot(),
      EffectsModule.forRoot(),
      EntityDataModule.forRoot({
        entityMetadata: DefaultEntityMetadataMap,
      }),
      StoreDevtoolsModule.instrument()
    ),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: DefaultDataServiceFactory, useClass: KubernetesDataServiceFactory },
    { provide: HTTP_INTERCEPTORS, useClass: KubernetesAuthorizerInterceptor, multi: true },
    {
      provide: KubernetesDataServiceFactoryConfig,
      useValue: {
        default: {
          usePatchInUpsert: true,
        },
      } satisfies KubernetesDataServiceFactoryConfig,
    },
  ],
}).catch((err) => console.error(err))
