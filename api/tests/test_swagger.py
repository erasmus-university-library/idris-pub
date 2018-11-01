from core import BaseTest


class SwaggerWebTest(BaseTest):
    def test_fetch_swagger_definitions(self):
        response = self.api.get('/__api__')
