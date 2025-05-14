import { Hooks } from "../agent/hooks/Hooks";
import { InterceptorResult } from "../agent/hooks/InterceptorResult";
import { wrapExport } from "../agent/hooks/wrapExport";
import { Wrapper } from "../agent/Wrapper";
import { detectPromptInjection } from "../vulnerabilities/prompt-injection/detectPromptInjection";

export class OpenAI implements Wrapper {
  private inspectOpenAIArgs(
    args: unknown[],
    operation: string
  ): InterceptorResult | undefined {
    console.log("openai_operation", operation)
     // args[0] is usually the options object for OpenAI
    const options = args[0];
    console.log(options);
    detectPromptInjection((options as any).input);
    return undefined;
  }

  wrap(hooks: Hooks) {
    hooks
      .addPackage("openai")
      .withVersion("^4.0.0")
      .onRequire((exports, pkgInfo) => {
        // Wrap chat.completions.create
        if (
          exports.Chat &&
          exports.Chat.prototype &&
          exports.Chat.prototype.completions &&
          exports.Chat.prototype.completions.create
        ) {
          wrapExport(exports.Chat.prototype.completions, "create", pkgInfo, {
            kind: undefined,
            inspectArgs: (args) =>
              this.inspectOpenAIArgs(args, "chat.completions.create"),
          });
        }

        // Wrap responses.create
        if (
          exports.Responses &&
          exports.Responses.prototype &&
          typeof exports.Responses.prototype.create === "function"
        ) {
          wrapExport(exports.Responses.prototype, "create", pkgInfo, {
            kind: undefined,
            inspectArgs: (args) =>
              this.inspectOpenAIArgs(args, "responses.create"),
          });
        }
      });
  }
}
