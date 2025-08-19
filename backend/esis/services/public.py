import requests
from colorama import Fore, Style, init
from django.apps import apps
from requests.exceptions import RequestException

init(autoreset=True)  # auto reset colors after each print

from ..utils import lookup_to_model_name

ESIS_URL = "https://hub.esis.edu.mn/svc/api/public/lookUp/:{lookupType}"


def public_service(lookupType: str, token: str) -> dict:
    url = ESIS_URL.format(lookupType=lookupType)
    model_name = lookup_to_model_name(lookupType)

    try:
        Model = apps.get_model("esis", model_name)
    except LookupError:
        print(Fore.RED + f"[ERROR] Model '{model_name}' not found in app 'esis'")
        return {"status": "failed", "reason": f"Model {model_name} not found"}

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except RequestException as e:
        print(Fore.RED + f"[ERROR] Request failed: {e}")
        return {"status": "failed", "reason": str(e)}

    try:
        data = response.json()
    except ValueError as e:
        print(Fore.RED + f"[ERROR] Failed to parse JSON: {e}")
        return {"status": "failed", "reason": str(e)}

    success_count = 0
    error_count = 0

    try:
        for item in data:
            code = item.get("lookupCode")
            name = item.get("lookupName")

            if code and name:
                Model.objects.update_or_create(code=code, defaults={"name": name})
                success_count += 1
                print(Fore.GREEN + f"[SUCCESS] Added/Updated: {code} - {name}")
            else:
                error_count += 1
                print(Fore.YELLOW + f"[WARNING] Missing code or name in item: {item}")

        print(Style.BRIGHT + f"\n{Fore.GREEN}✔ Success: {success_count}")
        print(Style.BRIGHT + f"{Fore.YELLOW}⚠ Warnings: {error_count}\n")

        return {
            "status": "success",
            "success_count": success_count,
            "warning_count": error_count,
        }

    except Exception as e:
        print(Fore.RED + f"[ERROR] Database error: {e}")
        return {"status": "failed", "reason": str(e)}
