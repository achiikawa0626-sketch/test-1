import argparse
import json
import os
import sys

from openai import OpenAI


SYSTEM_PROMPT = """
You help a grandchild reply warmly to messages from their grandmother.
Read the grandmother's message, notice the main topic and emotion, then write
three natural, polite follow-up questions or responses that keep the
conversation going.

Rules:
- Sound like a caring family member, not a business assistant.
- Keep each option one sentence.
- Avoid slang, sarcasm, and anything pushy.
- If the message sounds sad, worried, or lonely, include gentle support.
- Return only JSON that matches the requested schema.
""".strip()


RESPONSE_SCHEMA = {
    "type": "json_schema",
    "name": "grandma_follow_ups",
    "strict": True,
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "responses": {
                "type": "array",
                "minItems": 3,
                "maxItems": 3,
                "items": {"type": "string"},
            }
        },
        "required": ["responses"],
    },
}


def read_message(argument_message: str | None) -> str:
    if argument_message:
        return argument_message.strip()

    if not sys.stdin.isatty():
        return sys.stdin.read().strip()

    return input("Grandma's message: ").strip()


def create_follow_ups(message: str) -> list[str]:
    client = OpenAI()
    model = os.getenv("OPENAI_MODEL", "gpt-5")

    response = client.responses.create(
        model=model,
        instructions=SYSTEM_PROMPT,
        input=f"Grandmother's message:\n{message}",
        text={"format": RESPONSE_SCHEMA},
    )

    parsed = json.loads(response.output_text)
    responses = parsed["responses"]

    if not all(isinstance(item, str) for item in responses):
        raise ValueError("The model returned responses in an unexpected format.")

    return responses


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate three warm follow-up replies to a grandmother's message."
    )
    parser.add_argument(
        "message",
        nargs="?",
        help="Message from grandmother. If omitted, the script reads stdin or prompts you.",
    )
    args = parser.parse_args()

    message = read_message(args.message)
    if not message:
        print("Please provide a message from grandmother.", file=sys.stderr)
        return 1

    try:
        follow_ups = create_follow_ups(message)
    except Exception as error:
        print(f"Could not generate responses: {error}", file=sys.stderr)
        return 1

    for index, follow_up in enumerate(follow_ups, start=1):
        print(f"{index}. {follow_up}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
