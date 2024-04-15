import json
import os
import random
import string

from openai import OpenAI
from tqdm import tqdm

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class SeedData:
    """
    The SeedData class is used to manage and generate a seed data file. 
    Set the DEBUG_USE_SEED_DATA_PATH variable in backend/oasst_backend/config.py to choose the seed data file to use.
    """
    def __init__(self):
        self.data = [] # Stores all messages that need to be dumped in to the json seed data file
        self.ids = set() # Stores all unique ids of the messages to avoid duplicate ids
    
    def add_message(self, message):
        """
        Adds a message to the to-be seed data file and tracks the ids to avoid duplicate ids.
        """
        self.data.append(message)
        self.ids.add(message['task_message_id'])
        self.ids.add(message['user_message_id'])
        
    

    def generate_id(self, size=8, chars=string.ascii_lowercase + string.digits):
        """
        Generates a unique id for use as a task_message_id or user_message_id.
        """
        max_combinations = len(chars) ** size
        if len(self.ids) >= max_combinations:
            raise ValueError("All possible IDs are already in use")

        while True:
            res = ''.join(random.choice(chars) for _ in range(size))
            if res not in self.ids:
                return res
            
    def gen_message(self, parent_message_id, text, role):
        """
        Generates a message in the seed data message format.
        """
        return {
            "task_message_id": self.generate_id(),
            "user_message_id": self.generate_id(),
            "parent_message_id": parent_message_id,
            "text": text,
            "role": role
        }
        
    def dump(self, filename):
        """
        Converts the message list in to a json file.
        """
        with open(filename, 'w') as f:
            json.dump(self.data, f)
            
    def animal_rights_doc_request(self):
        """
        Returns a request for a document relevant to animal rights using the OpenAI API.
        Ex. "Please submit a document exploring the ethical considerations of using animals in circuses and the potential impact on their welfare and rights."
        """
        try:
            # Adjusted for the OpenAI API chat completions endpoint
            response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",  # or the latest available model
                messages=[
                    {"role": "system", "content": ""},
                    {"role": "user", "content": 
                        "Generate a SINGLE request for a document relevant to animal rights. \
                            Ex. 'Please submit a document about canadian laws pertaining to AG Gag Laws', \
                                'Please submit a document about media's influence on food choices', \
                            etc. I want a very diverse, creative set of document requests, all atleast somewhat relevant to animal rights and veganism.\
                                Ask for unique things!"},
                ],
                temperature=1.3,
                max_tokens=50,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            # Assuming the first completion is the one we want
            output = response.choices[0].message.content
            print(output)
            return output
        except Exception as e:
            print("Error calling OpenAI API:", e)
            return None
    
    # def animal_rights_doc_provide(self, topic):
    #     """
    #     Returns a fake URL to a subpage that seems to match up to the provided topic.
    #     Ex. "https://***.***.***/***/[***]"
    #     """
    #     try:
    #         # Adjusted for the OpenAI API chat completions endpoint
    #         response = client.chat.completions.create(
    #             model="gpt-3.5-turbo-0125",  # or the latest available model
    #             messages=[
    #                 {"role": "system", "content": ""},
    #                 {"role": "user", "content": 
    #                     f"Generate a fake URL to a subpage that seems to match up to this topic: {topic}\n Response MUST match: 'https://***.***.***/***/[***]'. asterisks do not indicate length."},
    #             ],
    #             temperature=1,
    #             max_tokens=100,
    #             top_p=1,
    #             frequency_penalty=0,
    #             presence_penalty=0
    #         )
    #         output = response.choices[0].message.content
    #         print(output)
    #         return output
    #     except Exception as e:
    #         print("Error calling OpenAI API:", e)
    #         return None


if __name__ == "__main__":
    seed_data = SeedData()

    # Append 15 messages to the seed data, each requesting a document related to animal rights.
    for i in range(15):
        doc_request = seed_data.gen_message(None, seed_data.animal_rights_doc_request(), "assistant")
        seed_data.add_message(doc_request)

    # If changing seed_data file, make sure to reconfigure DEBUG_USE_SEED_DATA_PATH variable in backend/oasst_backend/config.py
    seed_data.dump("backend/test_data/AR_document_request_seed_data.json")

