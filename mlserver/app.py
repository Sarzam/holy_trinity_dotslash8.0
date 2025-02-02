from flask import Flask, request, jsonify
import pandas as pd
import ollama
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the dataset
try:
    df = pd.read_csv('data.csv')  # Ensure data.csv exists
    # Ensure required columns exist
    required_columns = ['Title', 'Description', 'Required Documents', 'Website Link']
    for col in required_columns:
        if col not in df.columns:
            df[col] = np.nan
except FileNotFoundError:
    df = pd.DataFrame(columns=required_columns)  # Empty DataFrame as fallback

def create_prompt(user_data, user_query, policies_df):
    """
    Generates a structured prompt for Llama 3.2 to find relevant government schemes.
    """
    prompt = "You are an AI assistant trained to match users with government schemes based on their details and query.\n\n"

    prompt += "User Details:\n"
    prompt += f"- Name: {user_data.get('name', 'Not provided')}\n"
    prompt += f"- Age: {user_data.get('age', 'Not provided')}\n"
    prompt += f"- Gender: {user_data.get('gender', 'Not provided')}\n"
    prompt += f"- Marital Status: {user_data.get('maritalStatus', 'Not provided')}\n"
    prompt += f"- Occupation: {user_data.get('occupation', 'Not provided')}\n"
    prompt += f"- Education: {user_data.get('education', 'Not provided')}\n"
    prompt += f"- Government Employee: {'Yes' if user_data.get('isGovernmentEmployee', False) else 'No'}\n"
    prompt += f"- Children: {len(user_data.get('children', []))}\n"
    location = user_data.get('location', {})
    prompt += f"- Location: Latitude {location.get('latitude', 'N/A')}, Longitude {location.get('longitude', 'N/A')}\n"

    prompt += "\nUser Query:\n"
    prompt += f"{user_query}\n\n"

    prompt += "List of Available Policies:\n"
    for _, row in policies_df.iterrows():
        prompt += f"- {row['Title']}: {row['Description']}\n"

    prompt += "\n### Task ###\n"
    prompt += "Based on the user details and query, return ONLY a list of policy titles that are most relevant.\n"
    prompt += "DO NOT provide explanations or extra information. Return only the policy titles in a bullet-point list format. Give the top 3 most relevant policies.\nGIVE THE ANSWERS ONLY IN THE MENTIONED FORMAT"

    return prompt

def query_llama(prompt):
    """
    Queries the Llama 3.2 model with the structured prompt and extracts policy titles.
    """
    response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"]

def get_full_policy_data(policy_titles):
    """
    Given a list of policy titles, return the Title, Description, Required Documents, and Website from the DataFrame.
    The rows will be joined by '^' as the delimiter.
    """
    full_data = []
    for title in policy_titles:
        # Strip any extra whitespace from the title
        title = title[1:].strip()
        # Search for the row that matches the policy title
        policy_row = df[df['Title'] == title]
        if not policy_row.empty:
            # Ensure the order and format of the fields
            fields = ['Title', 'Description', 'Documents Required', 'Website']
            # Replace NaN values with an empty string
            policy_row = policy_row[fields].replace(np.nan, '', regex=True)
            full_row = '^'.join(policy_row.iloc[0].astype(str).apply(lambda x: x.replace('\n', ' ')).values)
            full_data.append(full_row)
    return full_data

@app.route('/recommend_policies', methods=['POST'])
def recommend_policies():
    try:
        data = request.json
        user_data = data.get("user_data", {})
        user_query = data.get("user_query", "")

        if not user_query:
            return jsonify({"error": "User query is required."}), 400

        prompt = create_prompt(user_data, user_query, df)
        response = query_llama(prompt)
        policy_titles = response.split("\n") if response else []

        # Get full data for the relevant policies
        full_policy_data = get_full_policy_data(policy_titles)

        return jsonify({"relevant_policies": full_policy_data})
    except Exception as e:
        print(f"Error in recommend_policies: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/generate', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt', '')

    try:
        print(f"Received prompt: {prompt}")
        output = ollama.generate(
            model='llama3.2',
            prompt=f'You are an expert who knows about the government policies of India, including all the schemes and policies that the government of India offers for particular groups. If the query is unrelated, steer the conversation back to these topics. Keep responses concise, accurate, and actionable. Prompt: {prompt}',
        )
        print(f"Response content: {output['response']}")
        return jsonify({"response": output['response']})
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)