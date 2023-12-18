import time
from base64 import b64encode
from Crypto.Hash import SHA256
from Crypto.Signature import PKCS1_v1_5
from Crypto.PublicKey import RSA

class XypSign:

    def __init__(self, KeyPath):
        self.KeyPath = KeyPath

    def __GetPrivKey(self):
        with open(self.KeyPath, "rb") as keyfile:
            return RSA.importKey(keyfile.read())

    def __toBeSigned(self, accessToken):
        return {
            'accessToken' : accessToken,
            'timeStamp' : self.__timestamp(),
        }

    def __buildParam(self, toBeSigned):
        return toBeSigned['accessToken'] + '.' + toBeSigned['timeStamp']

    def sign(self, accessToken):

        if accessToken:
            toBeSigned = self.__toBeSigned(accessToken)
            digest = SHA256.new()
            digest.update(self.__buildParam(toBeSigned).encode())
            pkey = self.__GetPrivKey()
            return toBeSigned, b64encode(PKCS1_v1_5.new(pkey).sign(digest))

    def __timestamp(self):
        return str(int(time.time()))

