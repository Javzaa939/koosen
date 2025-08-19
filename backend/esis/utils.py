from typing import Any, Dict, List, Optional, Type

import requests
from colorama import Fore, Style, init
from django.apps import apps
from django.db.models import Model
from requests.exceptions import RequestException

init(autoreset=True)  # auto reset colors after each print


def lookup_to_model_name(lookup_code: str) -> str:
    # Split by underscore, capitalize each word, join
    return "".join(word.title() for word in lookup_code.lower().split("_"))


def fetch_data(url: str, token: str) -> Optional[List]:
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except RequestException as e:
        print(Fore.RED + f"[ERROR] Request failed: {e}")
        return None

    try:
        data = response.json()
        result = data["RESULT"]

        if len(result) <= 0:
            print(Fore.YELLOW + "Data not found.")
            return None

        return result
    except ValueError as e:
        print(Fore.RED + f"[ERROR] Failed to parse JSON: {e}")
        return None


def service_template(
    url: str, app_name: str, model_name: str, uniq_key: str, token: str
) -> Dict:
    print(
        Fore.YELLOW
        + f"[START] Syncing data for {app_name}-{model_name}"
        + Style.RESET_ALL
    )

    try:
        Model = apps.get_model(app_name, model_name)
    except LookupError:
        msg = f"Model {model_name} not found in app '{app_name}'"
        print(Fore.RED + "[ERROR] " + msg + Style.RESET_ALL)
        return {"status": "failed", "reason": msg}

    print(Fore.CYAN + "[INFO] Fetching data..." + Style.RESET_ALL)
    data_list = fetch_data(url, token)
    if data_list is None:
        msg = "Failed to fetch data"
        print(Fore.RED + "[ERROR] " + msg + Style.RESET_ALL)
        return {"status": "failed", "reason": msg}

    print(
        Fore.CYAN
        + f"[INFO] Fetched {len(data_list)} items. Processing..."
        + Style.RESET_ALL
    )

    try:
        for idx, item in enumerate(data_list, start=1):
            new_item = {}
            for key, value in item.items():
                new_item[key.lower()] = value

            try:
                Model.objects.update_or_create(
                    **{uniq_key: new_item[uniq_key]}, defaults=new_item
                )
            except Exception as item_err:
                print(
                    Fore.YELLOW
                    + f"[WARN] Failed to save item {idx}: {item_err}"
                    + Style.RESET_ALL
                )

        print(
            Fore.GREEN
            + f"[END] Sync completed for {app_name}.{model_name}\n"
            + Style.RESET_ALL
        )
        return {"status": "success", "processed": len(data_list)}

    except Exception as e:
        msg = f"Database error: {e}"
        print(Fore.RED + "[ERROR] " + msg + Style.RESET_ALL)
        return {"status": "failed", "reason": msg}


def get_model(app_name: str, model_name: str) -> Optional[Type[Model]]:
    """
    Retrieve a Django model class by app name and model name.

    Args:
        app_name (str): The name of the Django app.
        model_name (str): The name of the model class.

    Returns:
        Type[Model] or None: The model class if found, otherwise None.
    """
    try:
        return apps.get_model(app_name, model_name)
    except LookupError:
        return None


def get_service_template(url: str, token: str) -> Dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except RequestException as e:
        msg = f"Request failed: {e}"
        print(Fore.RED + msg + Style.RESET_ALL)
        return {"status": "failed", "reason": msg}

    try:
        data = response.json()
        print(Fore.GREEN + "Success: Data fetched from service" + Style.RESET_ALL)
        return {"status": "success", "data": data}
    except ValueError as e:
        msg = f"Failed to parse JSON: {e}"
        print(Fore.RED + msg + Style.RESET_ALL)
        return {"status": "failed", "reason": msg}
