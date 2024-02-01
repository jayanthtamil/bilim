import { act } from "react-dom/test-utils";
import { ReactWrapper, ShallowWrapper } from "enzyme";

// https://github.com/enzymejs/enzyme/issues/2073
// https://github.com/wesbos/waait/blob/master/index.js
export function wait(amount = 0) {
  return new Promise((resolve) => setTimeout(resolve, amount));
}

// Use this in your test after mounting if you need just need to let the query finish without updating the wrapper
export async function actWait(amount = 0) {
  await act(async () => {
    await wait(amount);
  });
}

// Use this in your test after mounting if you want the query to finish and update the wrapper
export async function actUpdateWrapper(
  wrapper: ReactWrapper<any> | ShallowWrapper<any>,
  amount = 0
) {
  await act(async () => {
    wait(amount).then(() => {
      wrapper.update();
    });
  });
}
