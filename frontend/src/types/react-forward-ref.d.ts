import "react";

declare module "react" {
  function forwardRef<T, P = any>(
    render: ForwardRefRenderFunction<T, P>
  ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
}
