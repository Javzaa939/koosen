from typing import Dict, Optional, Type

import requests
from django.apps import apps
from django.db.models import Model
from requests.exceptions import RequestException


def lookup_to_model_name(lookup_code: str) -> str:
    # Split by underscore, capitalize each word, join
    return "".join(word.title() for word in lookup_code.lower().split("_"))


def service_template(url: str, app_name: str, model_name: str, token: str) -> dict:
    try:
        Model = apps.get_model(app_name, model_name)
    except LookupError:
        return {
            "status": "failed",
            "reason": f"Model {model_name} not found in app '{app_name}'",
        }

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except RequestException as e:
        return {"status": "failed", "reason": f"Request failed: {e}"}

    try:
        data = response.json()
    except ValueError as e:
        return {"status": "failed", "reason": f"Failed to parse JSON: {e}"}

    try:
        for key, value in data:
            low_key = key.lower()
            data = {low_key: value}
            Model.objects.update_or_create(**data, defaults={})
        return {"status": "success"}
    except Exception as e:
        return {"status": "failed", "reason": f"Database error: {e}"}


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


def get_service_template(url: str, token: str) -> Dict:

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except RequestException as e:
        return {"status": "failed", "reason": f"Request failed: {e}"}

    try:
        data = response.json()
        return {"status": "success", "data": data}
    except ValueError as e:
        return {"status": "failed", "reason": f"Failed to parse JSON: {e}"}
