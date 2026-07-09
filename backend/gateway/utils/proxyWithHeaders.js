import proxy from "express-http-proxy";

export const proxyWithUser =
(serviceUrl, extraOptions = {})=>{

 return proxy(
  serviceUrl,
  {
   ...extraOptions,
   proxyReqOptDecorator:
   (proxyReqOpts, srcReq)=>{

    if(srcReq.user){

      proxyReqOpts.headers[
       "x-user-id"
      ] =
      srcReq.user.userId;

      proxyReqOpts.headers[
       "x-user-email"
      ] =
      srcReq.user.email;
      if (srcReq.user.avatar) {
        proxyReqOpts.headers["x-user-avatar"] = srcReq.user.avatar;
      }

    }

    return proxyReqOpts;

   }

  }
 );

}