from typing import Dict, List, Optional

import requests
from colorama import Fore, Style, init
from django.apps import apps
from django.db import IntegrityError, transaction
from requests.exceptions import RequestException

init(autoreset=True)  # auto reset colors after each print

from ..utils import lookup_to_model_name

ESIS_URL = "https://hub.esis.edu.mn/svc/api/public/lookUp/{lookupType}"


def fetch_public_data(lookupType: str, token: str) -> Optional[List]:
    url = ESIS_URL.format(lookupType=lookupType)

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
        result = data["RESULT"]

        if len(result) <= 0:
            print(Fore.YELLOW + f"{lookupType} Data not found.")
            return None

        return result
    except ValueError as e:
        print(Fore.RED + f"[ERROR] Failed to parse JSON: {e}")
        return None


def sync_public_data(lookupType: str, token: str) -> Dict:

    data_list = fetch_public_data(lookupType, token)
    if data_list is None:
        return {"status": "failed"}

    model_name = lookup_to_model_name(lookupType)

    try:
        Model = apps.get_model("esis", model_name)
    except LookupError:
        print(Fore.RED + f"[ERROR] Model '{model_name}' not found in app 'esis'")
        return {"status": "failed", "reason": f"Model {model_name} not found"}

    success_count = 0
    error_count = 0
    try:
        for item in data_list:
            code = (item.get("lookupCode") or "").strip()
            name = (item.get("lookupName") or "").strip()

            if not code or not name:
                error_count += 1
                print(Fore.YELLOW + f"[WARNING] Missing code or name in item: {item}")
                continue
            try:
                with transaction.atomic():
                    Model.objects.update_or_create(
                        code=code,
                        defaults={"name": name},
                    )
                success_count += 1
            except IntegrityError as e:
                error_count += 1
                print(Fore.RED + f"[DB ERROR] Could not save item {item}: {e}")
            except Exception as e:
                error_count += 1
                print(Fore.RED + f"[ERROR] Unexpected error for item {item}: {e}")

        print(
            Style.BRIGHT
            + f"\n{Fore.BLUE}LookupType: {lookupType}  DATA LENGTH: {len(data_list)}"
        )
        print(Style.BRIGHT + f"{Fore.GREEN}✔ Success: {success_count}")
        print(Style.BRIGHT + f"{Fore.YELLOW}⚠ Warnings: {error_count}\n")

        return {
            "status": "success",
            "success_count": success_count,
            "warning_count": error_count,
        }

    except Exception as e:
        print(Fore.RED + f"[ERROR] Database error: {e}")
        return {"status": "failed", "reason": str(e)}
