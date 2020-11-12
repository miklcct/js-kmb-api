## [3.2.4] (2020-11-12)
* fix secret handling function binding problems

## [3.2.3] (2020-11-12)
* fix mobile ETA API
* use mobule API as default

## [3.2.2] (2020-11-09)
* handle invalid data

## [3.2.1] (2020-11-04)
* Replace HKSCS converter library which works in browser as well

## [3.2.0] (2020-11-04)
* Expose HKSCS handling as a new function `Kmb.convertHkscs` which currently works on Node but does nothing on browser

## [3.1.0] (2020-11-04)
* Handle HKSCS characters

## [3.0.0] (2020-10-30)
* **Breaking**: Allow choosing different API for ETA
  
  The second parameter on `Stopping.getEtas` has changed to use a fetcher rather than `GET` or `POST`.
  You can choose between `Stopping.callWebEtaApi` (default) or `Stopping.callMobileEtaApi` as the fetcher,
  or any custom fetcher.
  
  If you relied on using the mobile API with the second parameter, you need to change
  
  ```javascript
  stopping.getEtas(retry_count, 'POST')
  ```
  
  to
  
  ```javascript
  stopping.getEtas(retry_count, stopping.callMobileEtaApi.bind(stopping, 'POST'))
  ```

## [2.1.0] (2020-10-24)
* introduce storage versioning - it is now safe to reuse the same storage even the library version is changed

## [2.0.1] (2020-10-24)
* fixed a packaging issue causing missing cert preventing running on node.js
* moved @types/node into dev dependencies

## [2.0.0] (2020-10-23)
* initial independent release
