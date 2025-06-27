import math
import random

from flask import Flask, render_template


def distancia(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def ponto_valido(novo_ponto, pontos_existentes, min_dist=15):
    for p in pontos_existentes:
        if distancia((novo_ponto["x"], novo_ponto["y"]), (p["x"], p["y"])) < min_dist:
            return False
    return True

def gerar_pontos(n):
    pontos = []
    tentativas_max = 1000
    while len(pontos) < n and tentativas_max > 0:
        tentativas_max -= 1
        x = random.randint(20, 580)
        y = random.randint(20, 380)
        cor = f"rgb({random.randint(50, 200)}, {random.randint(50, 200)}, {random.randint(50, 200)})"
        novo_ponto = {"x": x, "y": y, "cor": cor}
        if ponto_valido(novo_ponto, pontos):
            pontos.append(novo_ponto)
    return pontos


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/menu')
def menu():
    return render_template('menu.html')

if __name__ == '__main__':
    app.run(debug=True)